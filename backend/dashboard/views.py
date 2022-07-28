from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, parsers, permissions, status
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from dashboard.models import Directory, Recording
from dashboard.serializers import (
    DirectoryDetailsSerializer,
    DirectorySerializer,
    RecodingSerializer,
)


class GetUserDirectoryMixin:
    def get_user_directory_queryset(self):
        return Directory.objects.filter(owner=self.request.user).prefetch_related("children", "recordings")

    def get_user_directory(self):
        pk = self.kwargs["dir_pk"]
        if not pk:
            try:
                return self.get_user_directory_queryset().get(
                    owner=self.request.user, parent__isnull=True, title="root"
                )
            except Directory.DoesNotExist:
                directory = Directory(owner=self.request.user, title="root")
                if self.action == "POST":
                    directory.save()
                return directory
        return get_object_or_404(self.get_user_directory_queryset(), owner=self.request.user, id=pk)


class DirectoryViewSet(
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    mixins.RetrieveModelMixin,
    GetUserDirectoryMixin,
    GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.JSONParser]
    serializer_class = DirectoryDetailsSerializer

    def get_queryset(self):
        return self.get_user_directory_queryset()

    def get_object(self):
        return self.get_user_directory()

    def create(self, request, *args, **kwargs):
        parent = self.get_object()
        serializer = DirectorySerializer(data=request.data)
        serializer.is_valid(True)
        Directory.objects.create(**serializer.validated_data, owner=parent.owner, parent=parent)
        parent.refresh_from_db()
        return Response(DirectoryDetailsSerializer(parent).data, status.HTTP_201_CREATED)


class RecordingViewSet(
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    GetUserDirectoryMixin,
    GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.JSONParser]
    serializer_class = RecodingSerializer

    def get_queryset(self):
        directory = self.get_user_directory()
        return Recording.objects.filter(directory=directory)

    def get_object(self):
        return self.get_queryset().filter(id=self.kwargs["rec_pk"])

    @extend_schema(responses={201: DirectoryDetailsSerializer})
    def create(self, request, *args, **kwargs):
        directory = self.get_user_directory()
        serializer = RecodingSerializer(data=request.data)
        serializer.is_valid(True)
        Recording.objects.create(**serializer.validated_data, directory=directory)
        directory.refresh_from_db()
        return Response(DirectoryDetailsSerializer(directory).data, status.HTTP_201_CREATED)
