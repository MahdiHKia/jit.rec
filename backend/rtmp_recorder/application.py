from datetime import datetime, timedelta
from pathlib import Path

from django.conf import settings
from pyrtmp.messages.audio import AudioMessage
from pyrtmp.messages.data import MetaDataMessage
from pyrtmp.messages.video import VideoMessage
from pyrtmp.misc.flvdump import FLVMediaType

from dashboard.models import get_recording_path

from .rtmp_services.flv_file import AsyncFLVFile
from .rtmp_services.rtmp_server import RTMPApplication, RTMPServer, RTMPSession
from .security import RecordToken, validate_record_token

RECORD_TOKEN_TTL = timedelta(minutes=settings.RECORD_TOKEN_TTL_MINUTES)


class RTMPRecorderApplication(RTMPApplication):
    def __init__(self, session: RTMPSession) -> None:
        super().__init__(session)
        self.flv_file: AsyncFLVFile = None
        self.record_token: RecordToken = None

    def authenticate(self):
        self.record_token = validate_record_token(self.session.token)
        if self.record_token:
            token_created = datetime.fromtimestamp(self.record_token.created)
            token_expired = (token_created + RECORD_TOKEN_TTL) < datetime.now()
            if not token_expired:
                return True
        return False

    async def __aenter__(self):
        path_str = get_recording_path(self.record_token.uri)

        # Make root dir if doesn't exists
        path = Path(path_str)
        path.parent.mkdir(parents=True, exist_ok=True)

        file_open_mode = "a" if path.exists() else "w"
        self.flv_file = AsyncFLVFile(path_str, file_open_mode)
        await self.flv_file.__aenter__()
        return self

    async def __aexit__(self, *args, **kwargs):
        if self.flv_file:
            await self.flv_file.__aexit__()

    async def handle_meta_data_message(self, message: MetaDataMessage):
        await self.flv_file.write(0, message.to_raw_meta(), FLVMediaType.OBJECT)

    async def handle_video_message(self, message: VideoMessage):
        await self.flv_file.write(message.timestamp, message.payload, FLVMediaType.VIDEO)

    async def handle_audio_message(self, message: AudioMessage):
        await self.flv_file.write(message.timestamp, message.payload, FLVMediaType.AUDIO)


def run_rtmp_recorder_server(host, port, workers):
    RTMPServer(host, port, workers, RTMPRecorderApplication).run_server()
