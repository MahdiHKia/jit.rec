from rest_framework import serializers

from .models import Directory, Recording


class RecodingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = ["id", "title"]


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
