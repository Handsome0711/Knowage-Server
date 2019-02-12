ALTER TABLE SBI_CROSS_NAVIGATION ADD COLUMN DESCRIPTION VARCHAR(200) NULL DEFAULT NULL,
								 ADD COLUMN BREADCRUMB VARCHAR(200) NULL DEFAULT NULL;
								 

-- NEWS Functionality
CREATE TABLE SBI_NEWS (
	ID int NOT NULL,
	NAME varchar(200) DEFAULT NULL,
	DESCRIPTION varchar(400) DEFAULT NULL,
	ACTIVE boolean,
	NEWS varchar(4000) DEFAULT NULL,
	MANUAL boolean,
	EXPIRATION_DATE timestamp NULL DEFAULT NULL,
	USER_IN varchar(100) NOT NULL,
	USER_UP varchar(100) DEFAULT NULL,
	USER_DE varchar(100) DEFAULT NULL,
	TIME_IN timestamp NOT NULL,
	TIME_UP timestamp NULL DEFAULT NULL,
	TIME_DE timestamp NULL DEFAULT NULL,
	SBI_VERSION_IN varchar(10) DEFAULT NULL,
	SBI_VERSION_UP varchar(10) DEFAULT NULL,
	SBI_VERSION_DE varchar(10) DEFAULT NULL,
	META_VERSION varchar(100) DEFAULT NULL,
	ORGANIZATION varchar(20) DEFAULT NULL,
	CATEGORY_ID int DEFAULT NULL,
	PRIMARY KEY (ID),
	CONSTRAINT FK_SBI_NEWS_SBI_DOMAINS_1 FOREIGN KEY (CATEGORY_ID) REFERENCES sbi_domains (VALUE_ID) ON DELETE NO ACTION ON UPDATE NO ACTION
) WITHOUT OIDS;


CREATE TABLE SBI_NEWS_ROLES (
	NEWS_ID int NOT NULL,
	EXT_ROLE_ID int NOT NULL,
	PRIMARY KEY (NEWS_ID,EXT_ROLE_ID),
	CONSTRAINT EXT_ROLE_ID FOREIGN KEY (EXT_ROLE_ID) REFERENCES sbi_ext_roles (EXT_ROLE_ID) ON DELETE NO ACTION ON UPDATE NO ACTION,
	CONSTRAINT NEWS_ID FOREIGN KEY (NEWS_ID) REFERENCES sbi_news (ID) ON DELETE CASCADE ON UPDATE NO ACTION
) WITHOUT OIDS;


CREATE TABLE SBI_NEWS_READ (
	ID int NOT NULL,
	"USER" varchar(100) NOT NULL,
	NEWS_ID int NOT NULL,
	USER_IN varchar(100) NOT NULL,
	USER_UP varchar(100) DEFAULT NULL,
	USER_DE varchar(100) DEFAULT NULL,
	TIME_IN timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	TIME_UP timestamp NULL DEFAULT NULL,
	TIME_DE timestamp NULL DEFAULT NULL,
	SBI_VERSION_IN varchar(10) DEFAULT NULL,
	SBI_VERSION_UP varchar(10) DEFAULT NULL,
	SBI_VERSION_DE varchar(10) DEFAULT NULL,
	META_VERSION varchar(100) DEFAULT NULL,
	ORGANIZATION varchar(20) DEFAULT NULL,
	PRIMARY KEY (ID),
	CONSTRAINT fk_news_id FOREIGN KEY (NEWS_ID) REFERENCES sbi_news (ID) ON DELETE CASCADE ON UPDATE NO ACTION
) WITHOUT OIDS;
-- NEWS Functionality End


-- NEWS - Changing column name
ALTER TABLE SBI_NEWS_READ RENAME COLUMN "USER" TO USER_ID;

ALTER TABLE SBI_NEWS_ROLES DROP CONSTRAINT EXT_ROLE_ID;
ALTER TABLE SBI_NEWS_ROLES DROP CONSTRAINT NEWS_ID;

ALTER TABLE SBI_NEWS_ROLES ADD CONSTRAINT FK_EXT_ROLE_ID FOREIGN KEY (EXT_ROLE_ID) REFERENCES SBI_EXT_ROLES (EXT_ROLE_ID) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE SBI_NEWS_ROLES ADD CONSTRAINT FK_SBI_NEWS_ID FOREIGN KEY (NEWS_ID) REFERENCES SBI_NEWS (ID) ON DELETE CASCADE ON UPDATE NO ACTION;