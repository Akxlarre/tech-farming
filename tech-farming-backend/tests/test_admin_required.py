import types
import importlib
import importlib.util
import os

from flask import Flask
import pytest

from app.utils import auth_supabase

class DummySupabase:
    def __init__(self):
        class Admin:
            def invite_user_by_email(self, email, data):
                return types.SimpleNamespace(user=types.SimpleNamespace(id="1"))
        class Auth:
            def __init__(self):
                self.admin = Admin()
        self.auth = Auth()

def load_usuarios(monkeypatch):
    monkeypatch.setattr(auth_supabase, "supabase", DummySupabase())
    monkeypatch.setattr("supabase.create_client", lambda u, k: DummySupabase(), raising=False)
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "routes", "usuarios.py")
    spec = importlib.util.spec_from_file_location("usuarios", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

@pytest.fixture
def non_admin(monkeypatch):
    user = types.SimpleNamespace(rol_id=2)
    perms = types.SimpleNamespace()
    monkeypatch.setattr(auth_supabase, "obtener_usuario_y_permisos", lambda: (user, perms))
    return user

@pytest.fixture
def app_ctx():
    app = Flask(__name__)
    ctx = app.test_request_context("/")
    ctx.push()
    yield ctx
    ctx.pop()

@pytest.mark.parametrize("func_name", ["invitar_usuario", "listar_trabajadores", "actualizar_permisos"])
def test_admin_endpoints_forbidden(non_admin, app_ctx, monkeypatch, func_name):
    usuarios = load_usuarios(monkeypatch)
    func = getattr(usuarios, func_name)
    if func_name == "actualizar_permisos":
        response = func(1)
    else:
        response = func()
    assert response[1] == 403
