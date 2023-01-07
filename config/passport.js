const { PrismaClient } = require("@prisma/client");
var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

const prisma = new PrismaClient();

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = require("../config/keys").secretOrKey || "secret";

module.exports = (passport) =>
  passport.use(
    new JwtStrategy(opts, function (payload, done) {
      const user = prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
