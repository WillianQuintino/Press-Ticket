import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import CheckSettings from "../../helpers/CheckSettings";
import { getIO } from "../../libs/socket";
import Queue from "../../models/Queue";
import User from "../../models/User";
import UserSession from "../../models/UserSession";
import sequelize from "../../database";

interface Request {
  email: string;
  password: string;
}

interface Response {
  serializedUser: {
    id: number;
    name: string;
    email: string;
    profile: string;
    online: boolean;
    isTricked: boolean;
    startWork: string;
    endWork: string;
    createdAt: Date;
    queues: Queue[];
    active: boolean;
  };
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email },
    include: ["queues"]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (!user.active) {
    throw new AppError("ERR_USER_INACTIVE", 401);
  }

  const Hr = new Date();

  const hh: number = Hr.getHours() * 60 * 60;
  const mm: number = Hr.getMinutes() * 60;
  const hora = hh + mm;

  const inicio: string = user.startWork;
  const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
  const mminicio = Number(inicio.split(":")[1]) * 60;
  const horainicio = hhinicio + mminicio;

  const termino: string = user.endWork;
  const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
  const mmtermino = Number(termino.split(":")[1]) * 60;
  const horatermino = hhtermino + mmtermino;

  if (hora < horainicio || hora > horatermino) {
    throw new AppError("ERR_OUT_OF_HOURS", 401);
  }

  if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  let sessionTimeoutHours = 8;
  try {
    const timeoutValue = await CheckSettings("sessionTimeout");
    sessionTimeoutHours = parseInt(timeoutValue, 10) || 8;
  } catch {
    // Setting não encontrado, usa o padrão de 8 horas
  }

  await sequelize.transaction(async t => {
    const lastSession = await UserSession.findOne({
      where: {
        userId: user.id,
        logoutAt: null
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (lastSession) {
      const lastActivity = new Date(lastSession.lastActivity).getTime();
      const currentTime = new Date().getTime();
      const diffHours = (currentTime - lastActivity) / (1000 * 60 * 60);

      // Sessão expirada: encerrar a antiga e criar uma nova — não bloquear o login
      if (diffHours >= sessionTimeoutHours) {
        await lastSession.update({ logoutAt: new Date() }, { transaction: t });
        await user.update(
          { online: false, currentSessionId: null },
          { transaction: t }
        );

        try {
          const io = getIO();
          io.emit("userSessionExpired", {
            userId: user.id,
            expired: true,
            message: "ERR_SESSION_EXPIRED"
          });
        } catch {
          // Socket.IO ainda não inicializado — broadcast não-crítico ignorado
        }

        const newSessionId = crypto.randomUUID();
        await UserSession.create(
          {
            userId: user.id,
            sessionId: newSessionId,
            loginAt: new Date(),
            lastActivity: new Date()
          },
          { transaction: t }
        );
        await user.update(
          { online: true, currentSessionId: newSessionId },
          { transaction: t }
        );
      } else {
        await lastSession.update(
          { lastActivity: new Date() },
          { transaction: t }
        );
        await user.update({ online: true }, { transaction: t });
      }
    } else {
      const newSessionId = crypto.randomUUID();
      await UserSession.create(
        {
          userId: user.id,
          sessionId: newSessionId,
          loginAt: new Date(),
          lastActivity: new Date()
        },
        { transaction: t }
      );
      await user.update(
        { online: true, currentSessionId: newSessionId },
        { transaction: t }
      );
    }
  });

  try {
    const io = getIO();
    io.emit("userSessionUpdate", {
      userId: user.id,
      online: true
    });
  } catch {
    // Socket.IO ainda não inicializado — login prossegue normalmente
  }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const serializedUser = await SerializeUser(user);

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;
