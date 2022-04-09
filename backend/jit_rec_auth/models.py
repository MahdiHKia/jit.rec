from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import IntegrityError, models, transaction
from django.utils.translation import gettext_lazy as _

from dashboard.models import Directory


class JitRecUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_("The Email must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        try:
            user.save()
        except IntegrityError:
            raise ValueError(f"Email {email} already exists.")
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))
        return self.create_user(email, password, **extra_fields)


class JitRecUser(AbstractUser):
    email = models.EmailField(
        _("email address"),
        unique=True,
        error_messages={"unique": _("A user with that email already exists.")},
    )
    root_directory = models.OneToOneField(
        Directory, on_delete=models.CASCADE, blank=True, related_name="owner"
    )

    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = JitRecUserManager()

    @transaction.atomic
    def save(self, *args, **kwargs) -> None:
        if not self.root_directory_id:
            self.root_directory = Directory.objects.create(title="/")
        return super().save(*args, **kwargs)
