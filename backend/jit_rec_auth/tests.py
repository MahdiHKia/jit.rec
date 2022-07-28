from django.urls import reverse
from rest_framework.test import APITestCase


class AuthApiTestHelpers:
    def login(self, email, password):
        return self.client.post(
            reverse("jit_rec_auth:login"),
            data={"email": email, "password": password},
            format="json",
        )

    def logout(self):
        return self.client.post(reverse("jit_rec_auth:logout"))

    def sign_up(self, email, password, first_name, last_name):
        return self.client.post(
            reverse("jit_rec_auth:sign_up"),
            data={"email": email, "password": password, "first_name": first_name, "last_name": last_name},
            format="json",
        )

    def get_user_info(self):
        return self.client.get(reverse("jit_rec_auth:user_info"))

    def update_user_info(self, first_name=None, last_name=None):
        data = {}
        if first_name:
            data["first_name"] = first_name
        if last_name:
            data["last_name"] = last_name
        return self.client.put(reverse("jit_rec_auth:user_info"), data=data, format="json")

    def change_password(self, old_password, new_password):
        return self.client.post(
            reverse("jit_rec_auth:user_info"),
            data={"old_password": old_password, "new_password": new_password},
            format="json",
        )


class TestAuth(APITestCase, AuthApiTestHelpers):
    fixtures = ["users.json"]

    def test_login_logout(self):
        response = self.login("admin@jit.rec", "adminpassword")
        response_data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_data["email"], "admin@jit.rec")
        self.assertEqual(response_data["first_name"], "admin-f-name")
        self.assertEqual(response_data["last_name"], "admin-l-name")
        self.assertNotIn("password", response_data)
        self.assertEqual(self.client.session["_auth_user_id"], "1")

        self.logout()
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_sign_up(self):
        response = self.sign_up("test_email@test.com", "testpassword", "test-f-name", "test-l-name")
        response_data = response.json()

        self.assertEqual(response.status_code, 201)
        self.assertIn("email", response_data)
        self.assertIn("first_name", response_data)
        self.assertIn("last_name", response_data)
        self.assertNotIn("password", response_data)
        self.assertEqual(self.client.session["_auth_user_id"], "2")

    def test_user_info(self):
        self.login("admin@jit.rec", "adminpassword")

        # Test get_user_info before update
        user_info_response_before_update = self.get_user_info()
        user_info_response_before_update_data = user_info_response_before_update.json()

        self.assertEqual(user_info_response_before_update.status_code, 200)
        self.assertEqual(user_info_response_before_update_data["email"], "admin@jit.rec")
        self.assertEqual(user_info_response_before_update_data["first_name"], "admin-f-name")
        self.assertEqual(user_info_response_before_update_data["last_name"], "admin-l-name")
        self.assertNotIn("password", user_info_response_before_update_data)

        # Test Update user data
        update_response = self.update_user_info("test-updated-f-name", "test-updated-l-name")
        update_response_data = update_response.json()

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response_data["email"], "admin@jit.rec")
        self.assertEqual(update_response_data["first_name"], "test-updated-f-name")
        self.assertEqual(update_response_data["last_name"], "test-updated-l-name")
        self.assertNotIn("password", update_response_data)

        # Test get_user_info after update
        user_info_response_before_update = self.get_user_info()
        user_info_response_before_update_data = user_info_response_before_update.json()

        self.assertEqual(user_info_response_before_update.status_code, 200)
        self.assertEqual(user_info_response_before_update_data["email"], "admin@jit.rec")
        self.assertEqual(user_info_response_before_update_data["first_name"], "test-updated-f-name")
        self.assertEqual(user_info_response_before_update_data["last_name"], "test-updated-l-name")
        self.assertNotIn("password", user_info_response_before_update_data)

    def test_update_user_data_must_be_partial(self):
        self.login("admin@jit.rec", "adminpassword")
        update_response = self.update_user_info(last_name="test-updated-l-name")
        update_response_data = update_response.json()

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response_data["first_name"], "admin-f-name")
        self.assertEqual(update_response_data["last_name"], "test-updated-l-name")

        # Test get_user_info after update
        user_info_response_before_update = self.get_user_info()
        user_info_response_before_update_data = user_info_response_before_update.json()

        self.assertEqual(user_info_response_before_update.status_code, 200)
        self.assertEqual(user_info_response_before_update_data["first_name"], "admin-f-name")
        self.assertEqual(user_info_response_before_update_data["last_name"], "test-updated-l-name")
        self.assertNotIn("password", user_info_response_before_update_data)
