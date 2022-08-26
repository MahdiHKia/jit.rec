from django.core.management.base import BaseCommand

from rtmp_recorder.application import run_rtmp_recorder_server


class Command(BaseCommand):
    help = "Run RTMP server"

    def add_arguments(self, parser):
        parser.add_argument(
            "-H", "--host", action="store", type=str, help="Service Host", default="127.0.0.1"
        )
        parser.add_argument("-P", "--port", action="store", type=str, help="Service Port", default="1935")
        parser.add_argument(
            "-W", "--workers", action="store", type=int, help="Service Workers count", default=4
        )

    def handle(self, host, port, workers, *args, **options):
        run_rtmp_recorder_server(host, port, workers)
