from django.urls import path

from . import views

app_name = "jit_rec_auth"
urlpatterns = [
    path("login", views.AuthViewSet.as_view({"post": "login"}), name="login"),
    path("sign_up", views.AuthViewSet.as_view({"post": "sign_up"}), name="sign_up"),
    path("logout", views.UserViewSet.as_view({"post": "logout"}), name="logout"),
    path("change_password", views.UserViewSet.as_view({"post": "change_password"}), name="change_password"),
    path(
        "user_info", views.UserViewSet.as_view({"get": "retrieve", "put": "partial_update"}), name="user_info"
    ),
]
