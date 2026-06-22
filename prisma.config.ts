const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://care_desk_user:care_desk_password@127.0.0.1:5432/care_desk';

export default {
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    path: './prisma/migrations',
  },
  schema: './prisma/schema.prisma',
};
