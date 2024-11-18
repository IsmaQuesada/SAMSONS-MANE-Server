/*
  Warnings:

  - Added the required column `estado` to the `Factura` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `factura` ADD COLUMN `estado` BOOLEAN NOT NULL;
