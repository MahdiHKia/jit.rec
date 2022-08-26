import asyncio
import logging
import socket
from multiprocessing import Process, Queue
from threading import Thread
from typing import List


class TCPServer:
    def __init__(
        self, host, port, worker_count, on_new_connection_handler, name="TCP Server", protocol="tcp"
    ) -> None:
        self.host = host
        self.port = port
        self.worker_count = worker_count
        self.on_new_connection_handler = on_new_connection_handler
        self.name = name
        self.protocol = protocol

    async def connection_handler(self, writer: asyncio.StreamWriter):
        try:
            stream_reader, stream_writer = await asyncio.open_connection(sock=writer)
            await self.on_new_connection_handler(stream_reader, stream_writer)
        except:
            logging.error("Exception while handling rtmp connection", exc_info=True)

    def process_worker(self, idx, connection_queue):
        logging.info(f"{self.name} worker running : WORKER_INDEX={idx}")
        event_loop = asyncio.new_event_loop()
        Thread(target=event_loop.run_forever).start()
        while True:
            if conn := connection_queue.get():
                asyncio.run_coroutine_threadsafe(self.connection_handler(**conn), event_loop)

    async def add_socket_to_queue(self, connection_queue: Queue, writer: asyncio.StreamWriter):
        fileno = writer.get_extra_info("socket").fileno()
        socket_instance = socket.fromfd(fileno, socket.AddressFamily.AF_INET, socket.SOCK_STREAM)
        connection_queue.put({"writer": socket_instance})
        writer.close()
        del writer

    def run_server(self):
        loop = asyncio.new_event_loop()
        process_list: List[Process] = []
        if self.worker_count > 1:
            connection_queue: Queue = Queue()
            for idx in range(self.worker_count):
                process_list.append(Process(target=self.process_worker, args=[idx, connection_queue]))
                process_list[-1].start()
            loop.run_until_complete(
                asyncio.start_server(
                    lambda _, w: self.add_socket_to_queue(connection_queue, w), self.host, self.port
                )
            )
        else:
            loop.run_until_complete(asyncio.start_server(self.connection_handler, self.host, self.port))

        logging.info(
            f"{self.name} is running on {self.protocol}://{self.host}:{self.port} "
            f"with {self.worker_count} workers."
        )
        try:
            loop.run_forever()
        except KeyboardInterrupt:
            for p in process_list:
                p.terminate()

    async def on_new_connection(reader, writer):
        raise NotImplementedError()
