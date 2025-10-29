ALTER TABLE affiliate_usage ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp when record was soft deleted (NULL = active)';

ALTER TABLE affiliate_usage ADD COLUMN deleted_by VARCHAR(255) NULL DEFAULT NULL COMMENT 'Username or identifier of who deleted this record';

ALTER TABLE affiliate_usage ADD INDEX idx_deleted_at (deleted_at);

ALTER TABLE affiliate_usage ADD INDEX idx_ambassador_deleted (ambassador_id, deleted_at);
