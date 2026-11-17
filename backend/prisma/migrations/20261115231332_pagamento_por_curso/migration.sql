-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "idInstrutor" INTEGER NOT NULL,
    "idCategoria" INTEGER NOT NULL,
    "nivel" TEXT NOT NULL,
    "dataPublicacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAtualizacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAulas" INTEGER NOT NULL DEFAULT 0,
    "totalHoras" REAL NOT NULL DEFAULT 0,
    "preco" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Curso_idInstrutor_fkey" FOREIGN KEY ("idInstrutor") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Curso_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Curso" ("dataAtualizacao", "dataPublicacao", "descricao", "id", "idCategoria", "idInstrutor", "nivel", "titulo", "totalAulas", "totalHoras") SELECT "dataAtualizacao", "dataPublicacao", "descricao", "id", "idCategoria", "idInstrutor", "nivel", "titulo", "totalAulas", "totalHoras" FROM "Curso";
DROP TABLE "Curso";
ALTER TABLE "new_Curso" RENAME TO "Curso";
CREATE TABLE "new_Pagamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idAssinatura" INTEGER,
    "idMatricula" INTEGER,
    "valorPago" REAL NOT NULL,
    "dataPagamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPagamento" TEXT NOT NULL,
    "idTransacaoGateway" TEXT NOT NULL,
    CONSTRAINT "Pagamento_idAssinatura_fkey" FOREIGN KEY ("idAssinatura") REFERENCES "Assinatura" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_idMatricula_fkey" FOREIGN KEY ("idMatricula") REFERENCES "Matricula" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pagamento" ("dataPagamento", "id", "idAssinatura", "idTransacaoGateway", "metodoPagamento", "valorPago") SELECT "dataPagamento", "id", "idAssinatura", "idTransacaoGateway", "metodoPagamento", "valorPago" FROM "Pagamento";
DROP TABLE "Pagamento";
ALTER TABLE "new_Pagamento" RENAME TO "Pagamento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
