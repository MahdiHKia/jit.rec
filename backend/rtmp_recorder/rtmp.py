import logging
from typing import Type

from aiofile import async_open
from django.conf import settings
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
from pyrtmp.misc.flvdump import BitArray, BitStream, FLVMediaType

from .tcp import TCPServer


class AsyncFLVFile:
    def __init__(self, filename: str) -> None:
        self.filename = filename
        self.file = None

    async def init(self) -> None:
        self.file = async_open(self.filename, "wb")
        await self.file.__aenter__()
        print("before open")
        self.prev_tag_size = 0
        # write header
        stream = BitStream()
        stream.append(b"FLV")
        stream.append(BitStream(uint=1, length=8))
        stream.append(BitStream(uint=5, length=8))
        stream.append(BitStream(uint=9, length=32))
        stream.append(BitStream(uint=self.prev_tag_size, length=32))
        await self.file.write(stream.bytes)

    async def write(self, timestamp: int, payload: bytes, media_type: FLVMediaType):
        if not self.file:
            await self.init()
        # preprocess
        payload_size = len(payload)
        self.prev_tag_size = 11 + payload_size

        stream = BitStream()
        # tag type
        stream.append(BitArray(uint=int(media_type), length=8))
        # payload size
        stream.append(BitArray(uint=payload_size, length=24))
        # timestamp
        stream.append(BitArray(uint=timestamp & 0x00FFFFFF, length=24))
        # timestamp ext
        stream.append(BitArray(uint=timestamp >> 24, length=8))
        # stream id
        stream.append(BitArray(uint=0, length=24))
        # payload
        stream.append(payload)
        # prev tag size
        stream.append(BitArray(uint=self.prev_tag_size, length=32))
        await self.file.write(stream.bytes)

    async def close(self):
        await self.file.close()


class RTMPApplication:
    def __init__(self, session: SessionManager, token) -> None:
        self.session = session
        self.token = token

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args, **kwargs):
        pass

    async def handle_meta_data_message(self, message):
        raise NotImplementedError()

    async def handle_video_message(self, message):
        raise NotImplementedError()

    async def handle_audio_message(self, message):
        raise NotImplementedError()


class RTMPRecorderApplication(RTMPApplication):
    def __init__(self, session: SessionManager, token) -> None:
        super().__init__(session, token)
        self.flv_file: AsyncFLVFile = None

    async def __aenter__(self):
        print("OPENNING FILE WITH", self.token, settings.RECORDINGS_PATH)
        self.flv_file = AsyncFLVFile("mahdi.flv")
        return self

    async def __aexit__(self, *args, **kwargs):
        if self.flv_file:
            await self.flv_file.close()

    async def handle_meta_data_message(self, message):
        await self.flv_file.write(0, message.to_raw_meta(), FLVMediaType.OBJECT)

    async def handle_video_message(self, message):
        await self.flv_file.write(message.timestamp, message.payload, FLVMediaType.VIDEO)

    async def handle_audio_message(self, message):
        await self.flv_file.write(message.timestamp, message.payload, FLVMediaType.AUDIO)


class RTMPConnection:
    def __init__(self, application: Type[RTMPApplication], tcp_reader, tcp_writer) -> None:
        self.application = application
        self.session = SessionManager(reader=tcp_reader, writer=tcp_writer)
        self.chunk_reader = self.session.read_chunks_from_stream()
        self.token = None

    async def do_handshake(self):
        await self.session.handshake()

        # NCConnect
        nc_connect_message = (await anext(self.chunk_reader)).as_message()
        self.token = nc_connect_message.command_object["app"]
        self.session.write_chunk_to_stream(WindowAcknowledgementSize(ack_window_size=5000000))
        self.session.write_chunk_to_stream(SetPeerBandwidth(ack_window_size=5000000, limit_type=2))
        self.session.write_chunk_to_stream(StreamBegin(stream_id=0))
        self.session.write_chunk_to_stream(SetChunkSize(chunk_size=8192))
        self.session.writer_chunk_size = 8192
        self.session.write_chunk_to_stream(nc_connect_message.create_response())
        await self.session.drain()

        # SetChunkSize
        set_chunk_size_message = (await anext(self.chunk_reader)).as_message()
        self.session.reader_chunk_size = set_chunk_size_message.chunk_size

        logging.info(f"Client connected {self.session.peername}")

    async def handle(self):
        try:
            await self.do_handshake()

            async with self.application(self.session, self.token) as app:
                async for chunk in self.chunk_reader:
                    message = chunk.as_message()
                    match message:
                        case MetaDataMessage():
                            await app.handle_meta_data_message(message)
                        case VideoMessage():
                            await app.handle_video_message(message)
                        case AudioMessage():
                            await app.handle_audio_message(message)
                        case NCCreateStream():
                            self.session.write_chunk_to_stream(message.create_response())
                            await self.session.drain()
                        case NSPublish():
                            self.session.write_chunk_to_stream(StreamBegin(stream_id=1))
                            self.session.write_chunk_to_stream(message.create_response())
                            await self.session.drain()

        except StreamClosedException as ex:
            logging.info(f"Client {self.session.peername} disconnected! {ex}")


class RTMPServer:
    def __init__(self, host, port, workers, application) -> None:
        self.application = application
        self.tcp_server = TCPServer(
            host, port, workers, self.on_new_connection_handler, "RTMP Server", "rtmp"
        )

    def run_server(self):
        self.tcp_server.run_server()

    async def on_new_connection_handler(self, reader, writer):
        await RTMPConnection(self.application, reader, writer).handle()
        writer.close()


def run_rtmp_server(host, port, workers):
    RTMPServer(host, port, workers, RTMPRecorderApplication).run_server()
