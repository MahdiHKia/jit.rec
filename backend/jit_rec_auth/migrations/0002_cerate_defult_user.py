from django.db import migrations


def create_default_user(apps, schema_editor):
    from django.contrib.auth import get_user_model

    # We can't import the model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    JitRecUser = get_user_model()
    JitRecUser.objects.create_superuser("admin@jit.rec", "adminpassword")


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("jit_rec_auth", "0001_initial"),
        ("dashboard", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_default_user, reverse_code=migrations.RunPython.noop),
    ]
