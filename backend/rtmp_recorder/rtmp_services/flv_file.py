from aiofile import async_open
from pyrtmp.misc.flvdump import BitArray, BitStream, FLVMediaType


class AsyncFLVFile:
    def __init__(self, file_path: str, mode: str) -> None:
        self.mode = mode
        self.prev_tag_size = 0
        self.file = async_open(file_path, f"{mode}b")

    async def write_headers(self):
        stream = BitStream()
        stream.append(b"FLV")
        stream.append(BitStream(uint=1, length=8))
        stream.append(BitStream(uint=5, length=8))
        stream.append(BitStream(uint=9, length=32))
        stream.append(BitStream(uint=self.prev_tag_size, length=32))
        await self.file.write(stream.bytes)

    async def __aenter__(self):
        await self.file.__aenter__()
        if self.mode == "w":
            await self.write_headers()

    async def __aexit__(self):
        await self.file.__aexit__()

    async def write(self, timestamp: int, payload: bytes, media_type: FLVMediaType):
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
