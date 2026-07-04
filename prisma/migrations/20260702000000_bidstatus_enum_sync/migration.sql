-- Fix enum drift for BidStatus without resetting the database
ALTER TYPE "BidStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "BidStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "BidStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED';
