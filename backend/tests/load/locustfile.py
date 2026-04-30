from locust import HttpUser, task, between, events
import json
import uuid

class MovieUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        self.username = f"load_test_{uuid.uuid4().hex[:8]}"
        self.password = "testpass123"
        self.email = f"{self.username}@loadtest.com"
        self.token = None

        reg_payload = {"username": self.username, "email": self.email, "password": self.password}
        reg_resp = self.client.post("/api/users/register", json=reg_payload)
        if reg_resp.status_code != 201:
            events.request_failure.fire(req_id=uuid.uuid4(), response_time=0, response_length=0, exception=Exception("Registration failed"))

        login_payload = {"email": self.email, "password": self.password}
        login_resp = self.client.post("/api/users/login", json=login_payload)
        if login_resp.status_code == 200:
            self.token = login_resp.json()["token"]
        else:
            events.request_failure.fire(req_id=uuid.uuid4(), response_time=0, response_length=0, exception=Exception("Login failed"))

    @task(3)
    def get_movies(self):
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/movies", headers=headers)
        else:
            self.client.get("/api/movies")

    @task(1)
    def get_recommendations(self):
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("/api/recommend", headers=headers)
        else:
            self.client.get("/api/movies")

    @task(1)
    def like_movie(self):
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            movie_id = "6909001a3b0041630b7ee1d9"
            self.client.post(f"/api/users/like/{movie_id}", headers=headers)
        else:
            self.client.get("/api/movies")