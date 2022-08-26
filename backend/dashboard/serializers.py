from datetime import datetime
from pathlib import Path

from django.conf import settings
from rest_framework import serializers

from rtmp_recorder.security import RecordToken, create_record_token

from .models import Directory, Recording


class RecodingSerializer(serializers.ModelSerializer):
    record_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Recording
        fields = ["id", "title", "record_url", "download_url"]

    def get_record_url(self, obj: Recording):
        token = create_record_token(RecordToken(uri=obj.file_uri, created=datetime.now().timestamp()))
        return f"{settings.RTMP_SERVER_BASE_URL}/{token}"

    def get_download_url(self, obj: Recording):

        if Path(obj.file_path).exists():
            return self.context["request"].build_absolute_uri("/statics/recordings/" + obj.file_uri)
        return None


class DirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ["id", "title"]


class DirectoryDetailsSerializer(serializers.ModelSerializer):
    breadcrumb = DirectorySerializer(many=True, read_only=True, source="get_ancestors")
    children = DirectorySerializer(many=True, read_only=True)
    recordings = RecodingSerializer(many=True, read_only=True)

    class Meta:
        model = Directory
        fields = ["id", "title", "breadcrumb", "children", "recordings"]
