-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assinatura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" INTEGER NOT NULL,
    "idPlano" INTEGER NOT NULL,
    "dataInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativa',
    CONSTRAINT "Assinatura_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assinatura_idPlano_fkey" FOREIGN KEY ("idPlano") REFERENCES "Plano" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Assinatura" ("dataFim", "dataInicio", "id", "idPlano", "idUsuario", "status") SELECT "dataFim", "dataInicio", "id", "idPlano", "idUsuario", "status" FROM "Assinatura";
DROP TABLE "Assinatura";
ALTER TABLE "new_Assinatura" RENAME TO "Assinatura";
CREATE TABLE "new_Avaliacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" INTEGER NOT NULL,
    "idCurso" INTEGER NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "dataAvaliacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Avaliacao" ("comentario", "dataAvaliacao", "id", "idCurso", "idUsuario", "nota") SELECT "comentario", "dataAvaliacao", "id", "idCurso", "idUsuario", "nota" FROM "Avaliacao";
DROP TABLE "Avaliacao";
ALTER TABLE "new_Avaliacao" RENAME TO "Avaliacao";
CREATE UNIQUE INDEX "Avaliacao_idUsuario_idCurso_key" ON "Avaliacao"("idUsuario", "idCurso");
CREATE TABLE "new_Certificado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" INTEGER NOT NULL,
    "idCurso" INTEGER NOT NULL,
    "idTrilha" INTEGER,
    "codigoVerificacao" TEXT NOT NULL,
    "dataEmissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificado_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificado_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificado_idTrilha_fkey" FOREIGN KEY ("idTrilha") REFERENCES "Trilha" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificado" ("codigoVerificacao", "dataEmissao", "id", "idCurso", "idTrilha", "idUsuario") SELECT "codigoVerificacao", "dataEmissao", "id", "idCurso", "idTrilha", "idUsuario" FROM "Certificado";
DROP TABLE "Certificado";
ALTER TABLE "new_Certificado" RENAME TO "Certificado";
CREATE UNIQUE INDEX "Certificado_codigoVerificacao_key" ON "Certificado"("codigoVerificacao");
CREATE TABLE "new_Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "idInstrutor" INTEGER NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "nivel" TEXT NOT NULL,
    "dataPublicacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAulas" INTEGER NOT NULL DEFAULT 0,
    "totalHoras" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Curso_idInstrutor_fkey" FOREIGN KEY ("idInstrutor") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Curso_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Curso" ("dataPublicacao", "descricao", "id", "idCategoria", "idInstrutor", "nivel", "titulo", "totalAulas", "totalHoras") SELECT "dataPublicacao", "descricao", "id", "idCategoria", "idInstrutor", "nivel", "titulo", "totalAulas", "totalHoras" FROM "Curso";
DROP TABLE "Curso";
ALTER TABLE "new_Curso" RENAME TO "Curso";
CREATE TABLE "new_Matricula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuario" INTEGER NOT NULL,
    "idCurso" INTEGER NOT NULL,
    "dataMatricula" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataConclusao" DATETIME,
    CONSTRAINT "Matricula_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Matricula_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Matricula" ("dataConclusao", "dataMatricula", "id", "idCurso", "idUsuario") SELECT "dataConclusao", "dataMatricula", "id", "idCurso", "idUsuario" FROM "Matricula";
DROP TABLE "Matricula";
ALTER TABLE "new_Matricula" RENAME TO "Matricula";
CREATE UNIQUE INDEX "Matricula_idUsuario_idCurso_key" ON "Matricula"("idUsuario", "idCurso");
CREATE TABLE "new_ProgressoAula" (
    "idUsuario" INTEGER NOT NULL,
    "idAula" INTEGER NOT NULL,
    "dataConclusao" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Pendente',

    PRIMARY KEY ("idUsuario", "idAula"),
    CONSTRAINT "ProgressoAula_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressoAula_idAula_fkey" FOREIGN KEY ("idAula") REFERENCES "Aula" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProgressoAula" ("dataConclusao", "idAula", "idUsuario", "status") SELECT "dataConclusao", "idAula", "idUsuario", "status" FROM "ProgressoAula";
DROP TABLE "ProgressoAula";
ALTER TABLE "new_ProgressoAula" RENAME TO "ProgressoAula";
CREATE TABLE "new_Trilha" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "idCategoria" INTEGER NOT NULL,
    CONSTRAINT "Trilha_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Trilha" ("descricao", "id", "idCategoria", "titulo") SELECT "descricao", "id", "idCategoria", "titulo" FROM "Trilha";
DROP TABLE "Trilha";
ALTER TABLE "new_Trilha" RENAME TO "Trilha";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
