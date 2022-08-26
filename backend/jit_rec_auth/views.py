from django.contrib.auth import authenticate, login, logout
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import mixins, parsers, permissions, serializers
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from jit_rec_auth.serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    SignUpSerializer,
    UserSerializer,
)

from .models import JitRecUser


class AuthViewSet(GenericViewSet):
    parser_classes = [parsers.JSONParser]

    def get_serializer_class(self):
        match self.action:
            case "login":
                return LoginSerializer
            case "sign_up":
                return SignUpSerializer
            case _:
                return UserSerializer

    @extend_schema(
        request=LoginSerializer,
        responses={
            200: UserSerializer,
            403: inline_serializer("error", {"message": serializers.CharField()}),
        },
    )
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid()
        email, password = serializer.validated_data.get("email"), serializer.validated_data.get("password")
        user = authenticate(email=email, password=password)
        if user:
            login(request, user)
            return Response(UserSerializer(user).data, status=200)
        return Response({"message": "email or password is wrong"}, status=403)

    @extend_schema(request=SignUpSerializer, responses={201: UserSerializer})
    def sign_up(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid()
        try:
            user = JitRecUser.objects.create_user(**serializer.validated_data)
        except ValueError as e:
            return Response({"message": str(e)}, status=400)

        login(request, user)
        return Response(UserSerializer(user).data, status=201)


class UserViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, GenericViewSet):

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.JSONParser]

    def get_serializer_class(self):
        match self.action:
            case "change_password":
                return ChangePasswordSerializer
            case "logout":
                return None
            case _:
                return UserSerializer

    def get_object(self):
        return self.request.user

    def change_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid()
        old_password, new_password = serializer.validated_data.get(
            "old_password"
        ), serializer.validated_data.get("new_password")
        user: JitRecUser = request.user
        if user.check_password(old_password):
            user.set_password(new_password)
            user.save()
            login(request, user)
            return Response(status=200)
        return Response(status=403)

    @extend_schema(
        request=inline_serializer("logout", {}),
        responses={200: inline_serializer("logout", {"message": serializers.CharField()})},
    )
    def logout(self, request):
        logout(request)
        return Response({"message": "user logged out successfully"}, status=200)
