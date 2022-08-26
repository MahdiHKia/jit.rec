import logging
from typing import Type

from pyrtmp import StreamClosedException
from pyrtmp.messages import SessionManager
from pyrtmp.messages.audio import AudioMessage
from pyrtmp.messages.command import NCCreateStream, NSPublish
from pyrtmp.messages.data import MetaDataMessage
from pyrtmp.messages.protocolcontrol import (
    SetChunkSize,
    SetPeerBandwidth,
    WindowAcknowledgementSize,
)
from pyrtmp.messages.usercontrol import StreamBegin
from pyrtmp.messages.video import VideoMessage

from .tcp_server import TCPServer


class RTMPSession:
    def __init__(self, tcp_reader, tcp_writer) -> None:
        self.manager = SessionManager(reader=tcp_reader, writer=tcp_writer)
        self.manager.chunk_reader = self.manager.read_chunks_from_stream()
        self.token = None

    async def do_handshake(self):
        await self.manager.handshake()

        # NCConnect
        nc_connect_message = (await anext(self.manager.chunk_reader)).as_message()
        self.token = nc_connect_message.command_object["app"]
        self.manager.write_chunk_to_stream(WindowAcknowledgementSize(ack_window_size=5000000))
        self.manager.write_chunk_to_stream(SetPeerBandwidth(ack_window_size=5000000, limit_type=2))
        self.manager.write_chunk_to_stream(StreamBegin(stream_id=0))
        self.manager.write_chunk_to_stream(SetChunkSize(chunk_size=8192))
        self.manager.writer_chunk_size = 8192
        self.manager.write_chunk_to_stream(nc_connect_message.create_response())
        await self.manager.drain()

    async def set_chunk_size(self):
        set_chunk_size_message = (await anext(self.manager.chunk_reader)).as_message()
        self.manager.reader_chunk_size = set_chunk_size_message.chunk_size


class RTMPApplication:
    def __init__(self, session: RTMPSession) -> None:
        self.session = session

    def authenticate(self):
        return True

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args, **kwargs):
        pass

    async def handle_nc_create_stream_message(self, message: NCCreateStream):
        self.session.manager.write_chunk_to_stream(message.create_response())
        await self.session.manager.drain()

    async def handle_ns_publish_message(self, message: NSPublish):
        self.session.manager.write_chunk_to_stream(StreamBegin(stream_id=1))
        self.session.manager.write_chunk_to_stream(message.create_response())
        await self.session.manager.drain()

    async def handle_meta_data_message(self, message: MetaDataMessage):
        raise NotImplementedError()

    async def handle_video_message(self, message: VideoMessage):
        raise NotImplementedError()

    async def handle_audio_message(self, message: AudioMessage):
        raise NotImplementedError()


class RTMPServer:
    def __init__(self, host, port, workers, application: Type[RTMPApplication]) -> None:
        self.application = application
        self.tcp_server = TCPServer(
            host, port, workers, self.on_new_connection_handler, "RTMP Server", "rtmp"
        )

    def run_server(self):
        self.tcp_server.run_server()

    async def on_new_connection_handler(self, reader, writer):
        session = RTMPSession(tcp_reader=reader, tcp_writer=writer)
        app_instance = self.application(session)
        try:
            await session.do_handshake()
            if app_instance.authenticate():
                await session.set_chunk_size()
                logging.info(f"Client connected {session.manager.peername}")

                async with app_instance as app:
                    async for chunk in session.manager.chunk_reader:
                        message = chunk.as_message()
                        match message:
                            case MetaDataMessage():
                                await app.handle_meta_data_message(message)
                            case VideoMessage():
                                await app.handle_video_message(message)
                            case AudioMessage():
                                await app.handle_audio_message(message)
                            case NCCreateStream():
                                await app.handle_nc_create_stream_message(message)
                            case NSPublish():
                                await app.handle_ns_publish_message(message)
            else:
                logging.info(f"Client connection refused {session.manager.peername}")
        except StreamClosedException as ex:
            logging.info(f"Client {session.manager.peername} disconnected! {ex}")

        writer.close()
