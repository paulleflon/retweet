/* Exécuter ces rquêtes SQL initialise les relations nécéssaires à l'application. */

CREATE TABLE `user` (
  `id` char(16) NOT NULL,
  `username` varchar(16) NOT NULL,
  `display_name` varchar(50) DEFAULT NULL,
  `email` varchar(350) DEFAULT NULL,
  `password` char(60) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `avatar_id` char(16) DEFAULT NULL,
  `banner_id` char(16) DEFAULT NULL,
  `bio` varchar(160) DEFAULT NULL,
  `website` varchar(50) DEFAULT NULL,
  `location` varchar(30) DEFAULT NULL,
  `follows` json NOT NULL,
  `followers` json NOT NULL,
  `likes` json NOT NULL,
  `is_admin` tinyint NOT NULL DEFAULT '0',
  `is_suspended` tinyint NOT NULL DEFAULT '0',
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`));

CREATE TABLE `tweet` (
  `id` CHAR(16) NOT NULL,
  `content` VARCHAR(280) NOT NULL,
  `author_id` CHAR(16) NOT NULL,
  `image_id` CHAR(16) NULL,
  `created_at` DATETIME NOT NULL,
  `replies_to` CHAR(16),
  `likes` JSON NOT NULL,
  `replies` JSON NOT NULL,
  `retweets` JSON NOT NULL,
  `is_deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

CREATE TABLE `image` (
  `id` CHAR(16) NOT NULL,
  `file` VARCHAR(300) NOT NULL,
  `type` INT NOT NULL,
  `user_id` CHAR(16),
  `tweet_id` CHAR(16),
  `created_at` DATETIME NOT NULL,
  `is_deleted` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`));

CREATE TABLE `auth` (
  `user_id` CHAR(16) NOT NULL,
  `token` CHAR(32) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `user_agent` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`token`));

CREATE TABLE `recover` (
  `user_id` CHAR(16) NOT NULL,
  `token` CHAR(32) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`token`));

CREATE TABLE `id` (
  `id` CHAR(16) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `type` TINYINT NOT NULL,
  PRIMARY KEY (`id`));
