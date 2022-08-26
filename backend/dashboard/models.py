from uuid import uuid4

from django.conf import settings
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey


class Directory(MPTTModel):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    parent = TreeForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="children")
    title = models.CharField(max_length=50)

    def get_ancestors(self, ascending=False, include_self=True):
        if not self.pk:
            return []
        return super().get_ancestors(ascending, include_self)


def get_recording_path(uri):
    return str(settings.RECORDINGS_PATH / uri)


class Recording(models.Model):
    title = models.CharField(max_length=50)
    directory = models.ForeignKey(Directory, on_delete=models.CASCADE, related_name="recordings")
    token = models.UUIDField(default=uuid4, editable=False)

    @property
    def file_uri(self):
        return f"{self.directory.owner_id}/{self.token}.flv"

    @property
    def file_path(self):
        return get_recording_path(self.file_uri)
