import asyncio
import socket
from multiprocessing import Process, Queue
from threading import Thread


class TCPServer:
    def __init__(self, host, port, client_connected_cb=None, worker_count=4) -> None:
        self.host = host
        self.port = port
        self.worker_count = worker_count
        if client_connected_cb:
            self.client_connected_cb = client_connected_cb

    async def connection_handler(self, writer):
        reader, writer_sock = await asyncio.open_connection(sock=writer)
        await self.client_connected_cb(reader, writer_sock)

    def listener(self, event_loop):
        while True:
            d = self.connection_queue.get()
            if not d:
                break
            asyncio.run_coroutine_threadsafe(self.connection_handler(**d), event_loop)

    def process_worker(self):
        event_loop = asyncio.new_event_loop()
        Thread(target=self.listener, args=(event_loop,)).start()
        event_loop.run_forever()

    async def add_socket_to_queue(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        fileno = writer.get_extra_info("socket").fileno()
        socket_instance = socket.fromfd(fileno, socket.AddressFamily.AF_INET, socket.SOCK_STREAM)
        self.connection_queue.put({"writer": socket_instance})
        writer.close()
        del writer

    def run_multiprocess_server(self):
        self.connection_queue: Queue = Queue()
        self.process_list = []
        for _ in range(self.worker_count):
            self.process_list.append(Process(target=self.process_worker))
            self.process_list[-1].start()
        loop = asyncio.new_event_loop()
        loop.run_until_complete(asyncio.start_server(self.add_socket_to_queue, self.host, self.port))
        loop.run_forever()

    def run_singleprocess_server(self):
        loop = asyncio.new_event_loop()
        loop.run_until_complete(asyncio.start_server(self.client_connected_cb, self.host, self.port))
        loop.run_forever()

    def run_server(self):
        if self.worker_count > 1:
            self.run_multiprocess_server()
        else:
            self.run_singleprocess_server()
