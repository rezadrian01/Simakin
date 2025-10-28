/*
  Warnings:

  - The values [HAFALAN] on the enum `Recitation_mode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `recitation` MODIFY `mode` ENUM('MUROJAAH', 'ZIYADAH') NOT NULL;
