from django.urls import path

from . import views

app_name = "dashboard"
urlpatterns = [
    path(
        "dir/<int:dir_pk>/",
        views.DirectoryViewSet.as_view(
            {"get": "retrieve", "post": "create", "delete": "destroy", "put": "update"}
        ),
        name="directory",
    ),
    path(
        "dir/<int:dir_pk>/recordings",
        views.RecordingViewSet.as_view({"post": "create"}),
        name="create-recordings",
    ),
    path(
        "dir/<int:dir_pk>/recordings/<int:rec_pk>/",
        views.RecordingViewSet.as_view({"delete": "destroy", "put": "update"}),
        name="modify-recordings",
    ),
]
