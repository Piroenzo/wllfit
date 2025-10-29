from datetime import date, timedelta
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import create_engine, String, Integer, Date, ForeignKey, Enum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session
import enum

# ---------- Setup ----------
class Base(DeclarativeBase): pass

class HabitType(enum.Enum):
    water = "water"
    sleep = "sleep"
    workout = "workout"

# ---------- Models ----------
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    habits: Mapped[list["Habit"]] = relationship(back_populates="user", cascade="all, delete")

class Habit(Base):
    __tablename__ = "habits"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[HabitType] = mapped_column(Enum(HabitType), nullable=False)
    entries: Mapped[list["HabitEntry"]] = relationship(back_populates="habit", cascade="all, delete")
    user: Mapped[User] = relationship(back_populates="habits")

class HabitEntry(Base):
    __tablename__ = "habit_entries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id"), nullable=False)
    day: Mapped[date] = mapped_column(Date, nullable=False)
    value: Mapped[int] = mapped_column(Integer, default=0)
    habit: Mapped[Habit] = relationship(back_populates="entries")

# 🎯 NUEVO MODELO: metas personalizadas por usuario
class UserGoal(Base):
    __tablename__ = "user_goals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    type: Mapped[HabitType] = mapped_column(Enum(HabitType), nullable=False)
    goal_value: Mapped[int] = mapped_column(Integer, default=0)

# ---------- Helper Functions ----------
def get_week_monday(d: date) -> date:
    return d - timedelta(days=d.weekday())

def to_dict_week(monday: date, values: list[int]):
    labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    return [{"day": labels[i], "value": values[i]} for i in range(7)]

def ensure_user_habits(session: Session, user_id: int):
    existing = {h.type for h in session.query(Habit).filter_by(user_id=user_id).all()}
    for t in [HabitType.water, HabitType.sleep, HabitType.workout]:
        if t not in existing:
            session.add(Habit(user_id=user_id, type=t))
    session.commit()

def ensure_user_goals(session: Session, user_id: int):
    existing = {g.type for g in session.query(UserGoal).filter_by(user_id=user_id).all()}
    defaults = {"water": 8, "sleep": 7, "workout": 1}
    for key, val in defaults.items():
        t = HabitType[key]
        if t not in existing:
            session.add(UserGoal(user_id=user_id, type=t, goal_value=val))
    session.commit()

def values_for_week(session: Session, habit: Habit, monday: date):
    vals = [0]*7
    entries = (
        session.query(HabitEntry)
        .filter(HabitEntry.habit_id == habit.id,
                HabitEntry.day >= monday,
                HabitEntry.day <= monday + timedelta(days=6))
        .all()
    )
    for e in entries:
        idx = (e.day - monday).days
        if 0 <= idx <= 6:
            vals[idx] = e.value
    return vals

def set_value_for_day(session: Session, habit_id: int, day: date, new_value: int):
    entry = session.query(HabitEntry).filter_by(habit_id=habit_id, day=day).first()
    if not entry:
        entry = HabitEntry(habit_id=habit_id, day=day, value=new_value)
        session.add(entry)
    else:
        entry.value = new_value
    session.commit()
    return entry.value

# ---------- App ----------
def create_app():
    app = Flask(__name__)
    CORS(app, origins="http://localhost:5173", supports_credentials=True)
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")
    jwt = JWTManager(app)

    engine = create_engine(os.getenv("DATABASE_URL", "sqlite:///wellfit.db"), echo=False)
    Base.metadata.create_all(engine)

    # ----- Auth -----
    @app.post("/auth/register")
    def register():
        data = request.get_json()
        email = (data.get("email") or "").lower().strip()
        password = data.get("password") or ""
        if not email or not password:
            return jsonify({"error":"email and password required"}), 400

        with Session(engine) as s:
            if s.query(User).filter_by(email=email).first():
                return jsonify({"error":"user exists"}), 409
            u = User(email=email, password=password)
            s.add(u); s.commit()
            ensure_user_habits(s, u.id)
            ensure_user_goals(s, u.id)
            token = create_access_token(identity=str(u.id))
            return jsonify({"token": token})

    @app.post("/auth/login")
    def login():
        data = request.get_json()
        email = (data.get("email") or "").lower().strip()
        password = data.get("password") or ""
        with Session(engine) as s:
            u = s.query(User).filter_by(email=email).first()
            if not u or u.password != password:
                return jsonify({"error":"invalid credentials"}), 401
            ensure_user_goals(s, u.id)
            token = create_access_token(identity=str(u.id))
            return jsonify({"token": token})

    # ----- Habits weekly -----
    @app.get("/habits/weekly")
    @jwt_required()
    def weekly():
        user_id = int(get_jwt_identity())
        qdate = request.args.get("date")
        base_day = date.fromisoformat(qdate) if qdate else date.today()
        monday = get_week_monday(base_day)

        with Session(engine) as s:
            ensure_user_habits(s, user_id)
            habits = s.query(Habit).filter_by(user_id=user_id).all()
            result = {}
            for h in habits:
                vals = values_for_week(s, h, monday)
                result[h.type.value] = to_dict_week(monday, vals)
            return jsonify({"weekStart": monday.isoformat(), "data": result})

    @app.post("/habits/update")
    @jwt_required()
    def update():
        user_id = int(get_jwt_identity())
        data = request.get_json()
        htype = data.get("type")
        op = data.get("op")
        qdate = data.get("date")
        d = date.fromisoformat(qdate) if qdate else date.today()

        if htype not in ["water","sleep","workout"]:
            return jsonify({"error":"invalid habit type"}), 400

        with Session(engine) as s:
            habit = s.query(Habit).filter_by(user_id=user_id, type=HabitType(htype)).first()
            ensure_user_habits(s, user_id)

            existing = s.query(HabitEntry).filter_by(habit_id=habit.id, day=d).first()
            current = existing.value if existing else 0

            if op == "inc":
                new_val = current + 1
            elif op == "dec":
                new_val = max(0, current - 1)
            elif op == "set":
                new_val = max(0, int(data.get("value") or 0))
            else:
                return jsonify({"error":"invalid op"}), 400

            val = set_value_for_day(s, habit.id, d, new_val)
            monday = get_week_monday(d)
            vals = values_for_week(s, habit, monday)

            return jsonify({
                "ok": True,
                "day": d.isoformat(),
                "type": htype,
                "value": val,
                "weekStart": monday.isoformat(),
                "weekly": to_dict_week(monday, vals)
            })

    # 🎯 ----- Goals -----
    @app.get("/goals")
    @jwt_required()
    def get_goals():
        user_id = int(get_jwt_identity())
        with Session(engine) as s:
            ensure_user_goals(s, user_id)
            goals = s.query(UserGoal).filter_by(user_id=user_id).all()
            data = {g.type.value: g.goal_value for g in goals}
            return jsonify(data)

    @app.post("/goals")
    @jwt_required()
    def update_goals():
        user_id = int(get_jwt_identity())
        data = request.get_json()
        updates = data.get("goals", {})

        with Session(engine) as s:
            for key, val in updates.items():
                if key not in ["water", "sleep", "workout"]:
                    continue
                goal = s.query(UserGoal).filter_by(user_id=user_id, type=HabitType(key)).first()
                if not goal:
                    goal = UserGoal(user_id=user_id, type=HabitType(key), goal_value=int(val))
                    s.add(goal)
                else:
                    goal.goal_value = int(val)
            s.commit()

            goals = s.query(UserGoal).filter_by(user_id=user_id).all()
            data = {g.type.value: g.goal_value for g in goals}
            return jsonify(data)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=5000, debug=True)
