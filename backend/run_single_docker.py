import os
import signal
import sys
from itertools import cycle
from subprocess import Popen, TimeoutExpired
from typing import List


class Service:
    def __init__(self, name, cmd) -> None:
        self.name = name
        self.cmd = cmd

    def run(self):
        self.popen = Popen(self.cmd, shell=True)


class ServiceManager:
    def __init__(self, *services: Service) -> None:
        self.service_pool: List[Service] = services

    def _terminate_handler(self, *args, **kwargs):
        raise KeyboardInterrupt

    def add_service(self, service: Service):
        self.service_pool.append(service)

    def run_all(self):
        for service in self.service_pool:
            service.run()
            print(f"Service {service.name} started with PID[{service.popen.pid}]")

    def wait_for_all(self):
        for service in cycle(self.service_pool):
            try:
                code = service.popen.wait(timeout=5)
            except TimeoutExpired:
                continue
            print(f"Service {service.name} with PID[{service.popen.pid}] exited with code {code}")
            return

    def kill_all(self):
        for service in self.service_pool:
            service.popen.terminate()
            code = None
            try:
                code = service.popen.wait(2)
            except TimeoutExpired:
                pass
            service.popen.kill()
            print("Killed", service.name, code)

    def start(self):
        exit_code = os.EX_SOFTWARE
        signal.signal(signal.SIGTERM, self._terminate_handler)
        self.run_all()
        try:
            self.wait_for_all()
        except KeyboardInterrupt:
            exit_code = os.EX_OK
            print("KeyboardInterrupt ...")
        self.kill_all()
        return exit_code


if __name__ == "__main__":
    rtmp_workers = os.environ["RTMP_WORKERS"]
    os.system("python manage.py migrate")

    exit_code = ServiceManager(
        Service(name="webservice", cmd="python manage.py runserver 0.0.0.0:8000"),
        Service(
            name="rtmp_service",
            cmd=f"python manage.py run_rtmp_server --host=0.0.0.0 --port=1930 --workers={rtmp_workers}",
        ),
        Service(name="nginx", cmd='nginx -g "daemon off;"'),
    ).start()
    sys.exit(exit_code)
