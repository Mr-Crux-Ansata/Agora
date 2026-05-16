/* =========================================
   Participatory Budgeting - Robust SQL Schema
   Microsoft SQL Server (T-SQL)
   ========================================= */

SET NOCOUNT ON;
GO

IF DB_ID(N'agora') IS NULL
BEGIN
    CREATE DATABASE [agora];
END
GO

USE [agora];
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'pb')
BEGIN
    EXEC('CREATE SCHEMA pb');
END
GO

/* =========================================
   Drop views and triggers first (rerunnable)
   ========================================= */
IF OBJECT_ID('pb.v_results_publication', 'V') IS NOT NULL DROP VIEW pb.v_results_publication;
IF OBJECT_ID('pb.v_proposal_public_summary', 'V') IS NOT NULL DROP VIEW pb.v_proposal_public_summary;
GO

IF OBJECT_ID('pb.trg_cycles_updated_at', 'TR') IS NOT NULL DROP TRIGGER pb.trg_cycles_updated_at;
IF OBJECT_ID('pb.trg_users_updated_at', 'TR') IS NOT NULL DROP TRIGGER pb.trg_users_updated_at;
IF OBJECT_ID('pb.trg_execution_updates_sync_status', 'TR') IS NOT NULL DROP TRIGGER pb.trg_execution_updates_sync_status;
IF OBJECT_ID('pb.trg_winning_projects_sync_selection', 'TR') IS NOT NULL DROP TRIGGER pb.trg_winning_projects_sync_selection;
IF OBJECT_ID('pb.trg_votes_validate_insert', 'TR') IS NOT NULL DROP TRIGGER pb.trg_votes_validate_insert;
IF OBJECT_ID('pb.trg_institutional_reviews_apply_decision', 'TR') IS NOT NULL DROP TRIGGER pb.trg_institutional_reviews_apply_decision;
IF OBJECT_ID('pb.trg_discussion_entries_updated_at', 'TR') IS NOT NULL DROP TRIGGER pb.trg_discussion_entries_updated_at;
IF OBJECT_ID('pb.trg_proposals_phase_consistency', 'TR') IS NOT NULL DROP TRIGGER pb.trg_proposals_phase_consistency;
IF OBJECT_ID('pb.trg_proposals_status_transition', 'TR') IS NOT NULL DROP TRIGGER pb.trg_proposals_status_transition;
IF OBJECT_ID('pb.trg_proposals_updated_at', 'TR') IS NOT NULL DROP TRIGGER pb.trg_proposals_updated_at;
GO

/* =========================================
   Drop tables in dependency order
   ========================================= */
IF OBJECT_ID('pb.audit_log', 'U') IS NOT NULL DROP TABLE pb.audit_log;
IF OBJECT_ID('pb.notifications', 'U') IS NOT NULL DROP TABLE pb.notifications;
IF OBJECT_ID('pb.share_events', 'U') IS NOT NULL DROP TABLE pb.share_events;
IF OBJECT_ID('pb.execution_updates', 'U') IS NOT NULL DROP TABLE pb.execution_updates;
IF OBJECT_ID('pb.winning_projects', 'U') IS NOT NULL DROP TABLE pb.winning_projects;
IF OBJECT_ID('pb.vote_receipts', 'U') IS NOT NULL DROP TABLE pb.vote_receipts;
IF OBJECT_ID('pb.votes', 'U') IS NOT NULL DROP TABLE pb.votes;
IF OBJECT_ID('pb.voter_eligibility', 'U') IS NOT NULL DROP TABLE pb.voter_eligibility;
IF OBJECT_ID('pb.institutional_reviews', 'U') IS NOT NULL DROP TABLE pb.institutional_reviews;
IF OBJECT_ID('pb.discussion_reactions', 'U') IS NOT NULL DROP TABLE pb.discussion_reactions;
IF OBJECT_ID('pb.discussion_entries', 'U') IS NOT NULL DROP TABLE pb.discussion_entries;
IF OBJECT_ID('pb.discussion_threads', 'U') IS NOT NULL DROP TABLE pb.discussion_threads;
IF OBJECT_ID('pb.proposal_status_history', 'U') IS NOT NULL DROP TABLE pb.proposal_status_history;
IF OBJECT_ID('pb.proposal_status_transition_rules', 'U') IS NOT NULL DROP TABLE pb.proposal_status_transition_rules;
IF OBJECT_ID('pb.proposal_documents', 'U') IS NOT NULL DROP TABLE pb.proposal_documents;
IF OBJECT_ID('pb.proposal_collaborators', 'U') IS NOT NULL DROP TABLE pb.proposal_collaborators;
IF OBJECT_ID('pb.proposal_versions', 'U') IS NOT NULL DROP TABLE pb.proposal_versions;
IF OBJECT_ID('pb.proposals', 'U') IS NOT NULL DROP TABLE pb.proposals;
IF OBJECT_ID('pb.cycle_phases', 'U') IS NOT NULL DROP TABLE pb.cycle_phases;
IF OBJECT_ID('pb.participatory_cycles', 'U') IS NOT NULL DROP TABLE pb.participatory_cycles;
IF OBJECT_ID('pb.categories', 'U') IS NOT NULL DROP TABLE pb.categories;
IF OBJECT_ID('pb.user_roles', 'U') IS NOT NULL DROP TABLE pb.user_roles;
IF OBJECT_ID('pb.roles', 'U') IS NOT NULL DROP TABLE pb.roles;
IF OBJECT_ID('pb.users', 'U') IS NOT NULL DROP TABLE pb.users;
IF OBJECT_ID('pb.neighborhoods', 'U') IS NOT NULL DROP TABLE pb.neighborhoods;
GO

/* =========================================
   Geography / Catalogs
   ========================================= */
CREATE TABLE pb.neighborhoods (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_neighborhoods PRIMARY KEY DEFAULT NEWID(),
    code                NVARCHAR(30) NOT NULL,
    name                NVARCHAR(120) NOT NULL,
    population          INT NULL,
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_neighborhoods_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_neighborhoods_code UNIQUE (code),
    CONSTRAINT CK_neighborhoods_population CHECK (population IS NULL OR population >= 0)
);
GO

CREATE TABLE pb.categories (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_categories PRIMARY KEY DEFAULT NEWID(),
    code                NVARCHAR(40) NOT NULL,
    name                NVARCHAR(120) NOT NULL,
    description         NVARCHAR(1000) NULL,
    CONSTRAINT UQ_categories_code UNIQUE (code)
);
GO

/* =========================================
   Core Identity / Access
   ========================================= */
CREATE TABLE pb.users (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_users PRIMARY KEY DEFAULT NEWID(),
    email               NVARCHAR(320) NOT NULL,
    full_name           NVARCHAR(200) NOT NULL,
    avatar_url          NVARCHAR(1000) NULL,
    neighborhood_id     UNIQUEIDENTIFIER NULL,
    is_verified         BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT (0),
    is_active           BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT (1),
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2(3) NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT FK_users_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES pb.neighborhoods(id)
);
GO

CREATE TABLE pb.roles (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_roles PRIMARY KEY DEFAULT NEWID(),
    role_code           NVARCHAR(50) NOT NULL,
    role_name           NVARCHAR(100) NOT NULL,
    CONSTRAINT UQ_roles_role_code UNIQUE (role_code)
);
GO

CREATE TABLE pb.user_roles (
    user_id             UNIQUEIDENTIFIER NOT NULL,
    role_id             UNIQUEIDENTIFIER NOT NULL,
    assigned_at         DATETIME2(3) NOT NULL CONSTRAINT DF_user_roles_assigned_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_user_roles_users FOREIGN KEY (user_id) REFERENCES pb.users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_roles_roles FOREIGN KEY (role_id) REFERENCES pb.roles(id) ON DELETE CASCADE
);
GO

/* =========================================
   Cycles and Phases (global governance)
   ========================================= */
CREATE TABLE pb.participatory_cycles (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_participatory_cycles PRIMARY KEY DEFAULT NEWID(),
    [year]              INT NOT NULL,
    title               NVARCHAR(250) NOT NULL,
    description         NVARCHAR(2000) NULL,
    total_budget        DECIMAL(14,2) NOT NULL,
    [status]            NVARCHAR(20) NOT NULL CONSTRAINT DF_cycles_status DEFAULT ('draft'),
    starts_at           DATETIME2(3) NOT NULL,
    ends_at             DATETIME2(3) NOT NULL,
    created_by          UNIQUEIDENTIFIER NULL,
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_cycles_created_at DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2(3) NOT NULL CONSTRAINT DF_cycles_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_cycles_year UNIQUE ([year]),
    CONSTRAINT CK_cycles_budget CHECK (total_budget >= 0),
    CONSTRAINT CK_cycles_dates CHECK (starts_at < ends_at),
    CONSTRAINT CK_cycles_status CHECK ([status] IN ('draft','active','closed','archived')),
    CONSTRAINT FK_cycles_created_by FOREIGN KEY (created_by) REFERENCES pb.users(id)
);
GO

CREATE TABLE pb.cycle_phases (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_cycle_phases PRIMARY KEY DEFAULT NEWID(),
    cycle_id            UNIQUEIDENTIFIER NOT NULL,
    phase               NVARCHAR(40) NOT NULL,
    starts_at           DATETIME2(3) NOT NULL,
    ends_at             DATETIME2(3) NOT NULL,
    is_current          BIT NOT NULL CONSTRAINT DF_cycle_phases_is_current DEFAULT (0),
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_cycle_phases_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_cycle_phases_cycle_phase UNIQUE (cycle_id, phase),
    CONSTRAINT CK_cycle_phases_dates CHECK (starts_at < ends_at),
    CONSTRAINT CK_cycle_phases_phase CHECK (phase IN (
        'discovery','proposal_submission','institutional_evaluation',
        'community_deliberation','voting','results_publication'
    )),
    CONSTRAINT FK_cycle_phases_cycles FOREIGN KEY (cycle_id) REFERENCES pb.participatory_cycles(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_cycle_phases_current ON pb.cycle_phases(cycle_id, is_current);
CREATE INDEX IX_cycle_phases_timerange ON pb.cycle_phases(cycle_id, starts_at, ends_at);
CREATE UNIQUE INDEX UX_cycle_phases_single_current ON pb.cycle_phases(cycle_id) WHERE is_current = 1;
GO

/* =========================================
   Proposals (separated status axes)
   ========================================= */
CREATE TABLE pb.proposals (
    id                          UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_proposals PRIMARY KEY DEFAULT NEWID(),
    cycle_id                     UNIQUEIDENTIFIER NOT NULL,
    author_id                    UNIQUEIDENTIFIER NOT NULL,
    neighborhood_id              UNIQUEIDENTIFIER NULL,
    category_id                  UNIQUEIDENTIFIER NULL,
    title                        NVARCHAR(250) NOT NULL,
    description                  NVARCHAR(MAX) NOT NULL,
    image_url                    NVARCHAR(1000) NULL,
    budget_requested             DECIMAL(14,2) NOT NULL,
    people_benefited_estimated   INT NULL,

    lifecycle_stage              NVARCHAR(40) NOT NULL CONSTRAINT DF_proposals_lifecycle DEFAULT ('draft'),
    institutional_status         NVARCHAR(30) NOT NULL CONSTRAINT DF_proposals_institutional DEFAULT ('pending'),
    participation_status         NVARCHAR(30) NOT NULL CONSTRAINT DF_proposals_participation DEFAULT ('not_open'),
    selection_status             NVARCHAR(30) NOT NULL CONSTRAINT DF_proposals_selection DEFAULT ('not_selected'),
    execution_status             NVARCHAR(30) NOT NULL CONSTRAINT DF_proposals_execution DEFAULT ('not_started'),
    impact_status                NVARCHAR(30) NOT NULL CONSTRAINT DF_proposals_impact DEFAULT ('not_assessed'),

    rejection_reason_code        NVARCHAR(80) NULL,
    technical_feedback           NVARCHAR(MAX) NULL,
    suggested_modifications      NVARCHAR(MAX) NULL,
    published_at                 DATETIME2(3) NULL,
    created_at                   DATETIME2(3) NOT NULL CONSTRAINT DF_proposals_created_at DEFAULT SYSUTCDATETIME(),
    updated_at                   DATETIME2(3) NOT NULL CONSTRAINT DF_proposals_updated_at DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_proposals_budget CHECK (budget_requested >= 0),
    CONSTRAINT CK_proposals_people CHECK (people_benefited_estimated IS NULL OR people_benefited_estimated >= 0),

    CONSTRAINT CK_proposals_lifecycle CHECK (lifecycle_stage IN (
        'draft','in_preparation','officially_submitted','under_institutional_review',
        'ready_for_deliberation','open_for_voting','voting_closed','rejected'
    )),
    CONSTRAINT CK_proposals_institutional CHECK (institutional_status IN ('pending','needs_changes','approved','rejected')),
    CONSTRAINT CK_proposals_participation CHECK (participation_status IN ('not_open','discussion_open','voting_open','voting_closed')),
    CONSTRAINT CK_proposals_selection CHECK (selection_status IN ('not_selected','winning_project')),
    CONSTRAINT CK_proposals_execution CHECK (execution_status IN ('not_started','in_progress','delayed','completed')),
    CONSTRAINT CK_proposals_impact CHECK (impact_status IN ('not_assessed','monitoring','verified')),
    CONSTRAINT CK_proposals_axis_coherence CHECK (
        (selection_status <> 'winning_project' OR (institutional_status = 'approved' AND participation_status = 'voting_closed'))
        AND (execution_status = 'not_started' OR selection_status = 'winning_project')
        AND (impact_status = 'not_assessed' OR execution_status = 'completed')
        AND (participation_status <> 'discussion_open' OR (lifecycle_stage = 'ready_for_deliberation' AND institutional_status = 'approved'))
        AND (participation_status <> 'voting_open' OR (lifecycle_stage = 'open_for_voting' AND institutional_status = 'approved'))
        AND (lifecycle_stage <> 'rejected' OR (institutional_status = 'rejected' AND participation_status = 'not_open' AND selection_status = 'not_selected' AND execution_status = 'not_started'))
    ),

    CONSTRAINT FK_proposals_cycle FOREIGN KEY (cycle_id) REFERENCES pb.participatory_cycles(id) ON DELETE CASCADE,
    CONSTRAINT FK_proposals_author FOREIGN KEY (author_id) REFERENCES pb.users(id),
    CONSTRAINT FK_proposals_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES pb.neighborhoods(id),
    CONSTRAINT FK_proposals_category FOREIGN KEY (category_id) REFERENCES pb.categories(id)
);
GO

CREATE INDEX IX_proposals_cycle_lifecycle ON pb.proposals(cycle_id, lifecycle_stage);
CREATE INDEX IX_proposals_cycle_participation ON pb.proposals(cycle_id, participation_status);
CREATE INDEX IX_proposals_cycle_institutional ON pb.proposals(cycle_id, institutional_status);
CREATE INDEX IX_proposals_selection_execution ON pb.proposals(selection_status, execution_status);
CREATE INDEX IX_proposals_author ON pb.proposals(author_id);
GO

CREATE TABLE pb.proposal_versions (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_proposal_versions PRIMARY KEY DEFAULT NEWID(),
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    version_no          INT NOT NULL,
    title               NVARCHAR(250) NOT NULL,
    description         NVARCHAR(MAX) NOT NULL,
    snapshot_json       NVARCHAR(MAX) NOT NULL,
    changed_by          UNIQUEIDENTIFIER NULL,
    change_note         NVARCHAR(1000) NULL,
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_proposal_versions_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_proposal_versions UNIQUE (proposal_id, version_no),
    CONSTRAINT CK_proposal_versions_version_no CHECK (version_no > 0),
    CONSTRAINT FK_proposal_versions_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_proposal_versions_changed_by FOREIGN KEY (changed_by) REFERENCES pb.users(id)
);
GO

CREATE TABLE pb.proposal_collaborators (
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    user_id             UNIQUEIDENTIFIER NOT NULL,
    can_edit            BIT NOT NULL CONSTRAINT DF_proposal_collab_can_edit DEFAULT (0),
    can_comment         BIT NOT NULL CONSTRAINT DF_proposal_collab_can_comment DEFAULT (1),
    added_at            DATETIME2(3) NOT NULL CONSTRAINT DF_proposal_collab_added_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_proposal_collaborators PRIMARY KEY (proposal_id, user_id),
    CONSTRAINT FK_proposal_collab_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_proposal_collab_user FOREIGN KEY (user_id) REFERENCES pb.users(id) ON DELETE CASCADE
);
GO

CREATE TABLE pb.proposal_documents (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_proposal_documents PRIMARY KEY DEFAULT NEWID(),
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    uploaded_by         UNIQUEIDENTIFIER NULL,
    file_name           NVARCHAR(260) NOT NULL,
    file_url            NVARCHAR(1000) NOT NULL,
    mime_type           NVARCHAR(150) NULL,
    file_size_bytes     BIGINT NULL,
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_proposal_documents_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_proposal_documents_size CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
    CONSTRAINT FK_proposal_documents_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_proposal_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES pb.users(id)
);
GO

/* =========================================
   Status transition rules + history
   ========================================= */
CREATE TABLE pb.proposal_status_transition_rules (
    axis_name           NVARCHAR(30) NOT NULL,
    from_value          NVARCHAR(40) NOT NULL,
    to_value            NVARCHAR(40) NOT NULL,
    CONSTRAINT PK_status_transition_rules PRIMARY KEY (axis_name, from_value, to_value),
    CONSTRAINT CK_status_transition_axis CHECK (axis_name IN (
        'lifecycle_stage','institutional_status','participation_status',
        'selection_status','execution_status','impact_status'
    ))
);
GO

INSERT INTO pb.proposal_status_transition_rules (axis_name, from_value, to_value) VALUES
('lifecycle_stage','draft','in_preparation'),
('lifecycle_stage','in_preparation','officially_submitted'),
('lifecycle_stage','officially_submitted','under_institutional_review'),
('lifecycle_stage','under_institutional_review','ready_for_deliberation'),
('lifecycle_stage','under_institutional_review','rejected'),
('lifecycle_stage','ready_for_deliberation','open_for_voting'),
('lifecycle_stage','open_for_voting','voting_closed'),

('institutional_status','pending','needs_changes'),
('institutional_status','pending','approved'),
('institutional_status','pending','rejected'),
('institutional_status','needs_changes','pending'),

('participation_status','not_open','discussion_open'),
('participation_status','discussion_open','voting_open'),
('participation_status','voting_open','voting_closed'),

('selection_status','not_selected','winning_project'),

('execution_status','not_started','in_progress'),
('execution_status','in_progress','delayed'),
('execution_status','delayed','in_progress'),
('execution_status','in_progress','completed'),
('execution_status','delayed','completed'),

('impact_status','not_assessed','monitoring'),
('impact_status','monitoring','verified');
GO

CREATE TABLE pb.proposal_status_history (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_proposal_status_history PRIMARY KEY DEFAULT NEWID(),
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    axis_name           NVARCHAR(30) NOT NULL,
    from_value          NVARCHAR(40) NULL,
    to_value            NVARCHAR(40) NOT NULL,
    changed_by          UNIQUEIDENTIFIER NULL,
    reason              NVARCHAR(1000) NULL,
    changed_at          DATETIME2(3) NOT NULL CONSTRAINT DF_status_history_changed_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_status_history_axis CHECK (axis_name IN (
        'lifecycle_stage','institutional_status','participation_status',
        'selection_status','execution_status','impact_status'
    )),
    CONSTRAINT FK_status_history_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES pb.users(id)
);
GO

/* =========================================
   Discussion (multiple typed threads per proposal)
   ========================================= */
CREATE TABLE pb.discussion_threads (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_discussion_threads PRIMARY KEY DEFAULT NEWID(),
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    thread_type         NVARCHAR(30) NOT NULL,
    title               NVARCHAR(250) NOT NULL,
    is_locked           BIT NOT NULL CONSTRAINT DF_discussion_threads_is_locked DEFAULT (0),
    created_by          UNIQUEIDENTIFIER NULL,
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_discussion_threads_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_discussion_thread_type CHECK (thread_type IN ('discussion','suggestions','local_context','qa')),
    CONSTRAINT UQ_discussion_threads_type UNIQUE (proposal_id, thread_type),
    CONSTRAINT FK_discussion_threads_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_discussion_threads_created_by FOREIGN KEY (created_by) REFERENCES pb.users(id)
);
GO

CREATE TABLE pb.discussion_entries (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_discussion_entries PRIMARY KEY DEFAULT NEWID(),
    thread_id           UNIQUEIDENTIFIER NOT NULL,
    author_id           UNIQUEIDENTIFIER NULL,
    entry_type          NVARCHAR(30) NOT NULL CONSTRAINT DF_discussion_entries_type DEFAULT ('discussion'),
    body                NVARCHAR(MAX) NOT NULL,
    is_edited           BIT NOT NULL CONSTRAINT DF_discussion_entries_is_edited DEFAULT (0),
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_discussion_entries_created_at DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2(3) NOT NULL CONSTRAINT DF_discussion_entries_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_discussion_entries_type CHECK (entry_type IN ('discussion','suggestion','question','local_context')),
    CONSTRAINT FK_discussion_entries_thread FOREIGN KEY (thread_id) REFERENCES pb.discussion_threads(id) ON DELETE CASCADE,
    CONSTRAINT FK_discussion_entries_author FOREIGN KEY (author_id) REFERENCES pb.users(id)
);
GO

CREATE INDEX IX_discussion_entries_thread_created ON pb.discussion_entries(thread_id, created_at DESC);
GO

CREATE TABLE pb.discussion_reactions (
    entry_id            UNIQUEIDENTIFIER NOT NULL,
    user_id             UNIQUEIDENTIFIER NOT NULL,
    reaction            NVARCHAR(20) NOT NULL,
    created_at          DATETIME2(3) NOT NULL CONSTRAINT DF_discussion_reactions_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_discussion_reactions PRIMARY KEY (entry_id, user_id, reaction),
    CONSTRAINT CK_discussion_reactions_type CHECK (reaction IN ('like','support','insightful','disagree')),
    CONSTRAINT FK_discussion_reactions_entry FOREIGN KEY (entry_id) REFERENCES pb.discussion_entries(id) ON DELETE CASCADE,
    CONSTRAINT FK_discussion_reactions_user FOREIGN KEY (user_id) REFERENCES pb.users(id) ON DELETE CASCADE
);
GO

/* =========================================
   Institutional Review (decision engine hook)
   ========================================= */
CREATE TABLE pb.institutional_reviews (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_institutional_reviews PRIMARY KEY DEFAULT NEWID(),
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    reviewer_id         UNIQUEIDENTIFIER NULL,
    decision            NVARCHAR(20) NOT NULL,
    is_final            BIT NOT NULL CONSTRAINT DF_institutional_reviews_is_final DEFAULT (1),
    technical_feedback  NVARCHAR(MAX) NULL,
    legal_feedback      NVARCHAR(MAX) NULL,
    budget_feedback     NVARCHAR(MAX) NULL,
    decision_reason     NVARCHAR(1000) NULL,
    reviewed_at         DATETIME2(3) NOT NULL CONSTRAINT DF_institutional_reviews_reviewed_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_institutional_reviews_decision CHECK (decision IN ('approved','rejected','needs_changes')),
    CONSTRAINT FK_institutional_reviews_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_institutional_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES pb.users(id)
);
GO

CREATE INDEX IX_institutional_reviews_proposal_reviewed ON pb.institutional_reviews(proposal_id, reviewed_at DESC);
GO

/* =========================================
   Voting
   ========================================= */
CREATE TABLE pb.voter_eligibility (
    cycle_id            UNIQUEIDENTIFIER NOT NULL,
    user_id             UNIQUEIDENTIFIER NOT NULL,
    is_eligible         BIT NOT NULL CONSTRAINT DF_voter_eligibility_is_eligible DEFAULT (1),
    validated_at        DATETIME2(3) NOT NULL CONSTRAINT DF_voter_eligibility_validated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_voter_eligibility PRIMARY KEY (cycle_id, user_id),
    CONSTRAINT FK_voter_eligibility_cycle FOREIGN KEY (cycle_id) REFERENCES pb.participatory_cycles(id) ON DELETE CASCADE,
    CONSTRAINT FK_voter_eligibility_user FOREIGN KEY (user_id) REFERENCES pb.users(id) ON DELETE CASCADE
);
GO

CREATE TABLE pb.votes (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_votes PRIMARY KEY DEFAULT NEWID(),
    cycle_id            UNIQUEIDENTIFIER NOT NULL,
    proposal_id         UNIQUEIDENTIFIER NOT NULL,
    voter_id            UNIQUEIDENTIFIER NOT NULL,
    cast_at             DATETIME2(3) NOT NULL CONSTRAINT DF_votes_cast_at DEFAULT SYSUTCDATETIME(),
    client_fingerprint  NVARCHAR(255) NULL,
    receipt_hash        NVARCHAR(255) NULL,
    CONSTRAINT UQ_votes_once UNIQUE (cycle_id, proposal_id, voter_id),
    CONSTRAINT FK_votes_cycle FOREIGN KEY (cycle_id) REFERENCES pb.participatory_cycles(id) ON DELETE NO ACTION,
    CONSTRAINT FK_votes_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_votes_voter FOREIGN KEY (voter_id) REFERENCES pb.users(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_votes_cycle_proposal ON pb.votes(cycle_id, proposal_id);
CREATE INDEX IX_votes_voter ON pb.votes(voter_id);
CREATE INDEX IX_votes_proposal ON pb.votes(proposal_id);
GO

CREATE TABLE pb.vote_receipts (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_vote_receipts PRIMARY KEY DEFAULT NEWID(),
    vote_id             UNIQUEIDENTIFIER NOT NULL,
    receipt_code        NVARCHAR(100) NOT NULL,
    issued_at           DATETIME2(3) NOT NULL CONSTRAINT DF_vote_receipts_issued_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_vote_receipts_vote UNIQUE (vote_id),
    CONSTRAINT UQ_vote_receipts_code UNIQUE (receipt_code),
    CONSTRAINT FK_vote_receipts_vote FOREIGN KEY (vote_id) REFERENCES pb.votes(id) ON DELETE CASCADE
);
GO

/* =========================================
   Selection, execution and impact
   ========================================= */
CREATE TABLE pb.winning_projects (
    proposal_id          UNIQUEIDENTIFIER NOT NULL,
    cycle_id             UNIQUEIDENTIFIER NOT NULL,
    rank_position        INT NOT NULL,
    approved_budget      DECIMAL(14,2) NOT NULL,
    announced_at         DATETIME2(3) NOT NULL CONSTRAINT DF_winning_projects_announced_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_winning_projects PRIMARY KEY (proposal_id),
    CONSTRAINT CK_winning_projects_rank CHECK (rank_position > 0),
    CONSTRAINT CK_winning_projects_budget CHECK (approved_budget >= 0),
    CONSTRAINT UQ_winning_projects_cycle_rank UNIQUE (cycle_id, rank_position),
    CONSTRAINT FK_winning_projects_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_winning_projects_cycle FOREIGN KEY (cycle_id) REFERENCES pb.participatory_cycles(id) ON DELETE NO ACTION
);
GO

CREATE TABLE pb.execution_updates (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_execution_updates PRIMARY KEY DEFAULT NEWID(),
    proposal_id          UNIQUEIDENTIFIER NOT NULL,
    progress_percent     INT NOT NULL,
    summary              NVARCHAR(MAX) NOT NULL,
    evidence_url         NVARCHAR(1000) NULL,
    reported_by          UNIQUEIDENTIFIER NULL,
    reported_at          DATETIME2(3) NOT NULL CONSTRAINT DF_execution_updates_reported_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_execution_updates_progress CHECK (progress_percent BETWEEN 0 AND 100),
    CONSTRAINT FK_execution_updates_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_execution_updates_reported_by FOREIGN KEY (reported_by) REFERENCES pb.users(id)
);
GO

/* =========================================
   Sharing, Notifications, Audit
   ========================================= */
CREATE TABLE pb.share_events (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_share_events PRIMARY KEY DEFAULT NEWID(),
    proposal_id          UNIQUEIDENTIFIER NOT NULL,
    shared_by            UNIQUEIDENTIFIER NULL,
    channel              NVARCHAR(20) NOT NULL,
    target_url           NVARCHAR(1000) NOT NULL,
    qr_payload           NVARCHAR(MAX) NULL,
    created_at           DATETIME2(3) NOT NULL CONSTRAINT DF_share_events_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_share_events_channel CHECK (channel IN ('whatsapp','instagram','facebook','qr')),
    CONSTRAINT FK_share_events_proposal FOREIGN KEY (proposal_id) REFERENCES pb.proposals(id) ON DELETE CASCADE,
    CONSTRAINT FK_share_events_shared_by FOREIGN KEY (shared_by) REFERENCES pb.users(id)
);
GO

CREATE INDEX IX_share_events_proposal_created ON pb.share_events(proposal_id, created_at DESC);
CREATE INDEX IX_share_events_channel_created ON pb.share_events(channel, created_at DESC);
GO

CREATE TABLE pb.notifications (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_notifications PRIMARY KEY DEFAULT NEWID(),
    user_id              UNIQUEIDENTIFIER NOT NULL,
    channel              NVARCHAR(20) NOT NULL CONSTRAINT DF_notifications_channel DEFAULT ('in_app'),
    title                NVARCHAR(250) NOT NULL,
    body                 NVARCHAR(MAX) NOT NULL,
    is_read              BIT NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT (0),
    metadata_json        NVARCHAR(MAX) NOT NULL CONSTRAINT DF_notifications_metadata DEFAULT ('{}'),
    created_at           DATETIME2(3) NOT NULL CONSTRAINT DF_notifications_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_notifications_channel CHECK (channel IN ('in_app','email','sms','push')),
    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id) REFERENCES pb.users(id) ON DELETE CASCADE
);
GO

CREATE TABLE pb.audit_log (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_audit_log PRIMARY KEY DEFAULT NEWID(),
    actor_user_id        UNIQUEIDENTIFIER NULL,
    entity_name          NVARCHAR(120) NOT NULL,
    entity_id            UNIQUEIDENTIFIER NULL,
    action               NVARCHAR(30) NOT NULL,
    before_data_json     NVARCHAR(MAX) NULL,
    after_data_json      NVARCHAR(MAX) NULL,
    ip_address           NVARCHAR(45) NULL,
    created_at           DATETIME2(3) NOT NULL CONSTRAINT DF_audit_log_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_audit_action CHECK (action IN ('insert','update','delete','status_transition','vote_cast','vote_revoked')),
    CONSTRAINT FK_audit_actor FOREIGN KEY (actor_user_id) REFERENCES pb.users(id)
);
GO

CREATE INDEX IX_audit_entity ON pb.audit_log(entity_name, entity_id, created_at DESC);
GO

/* =========================================
   Triggers
   ========================================= */
CREATE TRIGGER pb.trg_users_updated_at
ON pb.users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u
    SET updated_at = SYSUTCDATETIME()
    FROM pb.users u
    JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER pb.trg_cycles_updated_at
ON pb.participatory_cycles
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE c
    SET updated_at = SYSUTCDATETIME()
    FROM pb.participatory_cycles c
    JOIN inserted i ON c.id = i.id;
END;
GO

CREATE TRIGGER pb.trg_proposals_updated_at
ON pb.proposals
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE p
    SET updated_at = SYSUTCDATETIME()
    FROM pb.proposals p
    JOIN inserted i ON p.id = i.id;
END;
GO

CREATE TRIGGER pb.trg_proposals_status_transition
ON pb.proposals
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN deleted d ON i.id = d.id
        CROSS APPLY (VALUES
            ('lifecycle_stage', d.lifecycle_stage, i.lifecycle_stage),
            ('institutional_status', d.institutional_status, i.institutional_status),
            ('participation_status', d.participation_status, i.participation_status),
            ('selection_status', d.selection_status, i.selection_status),
            ('execution_status', d.execution_status, i.execution_status),
            ('impact_status', d.impact_status, i.impact_status)
        ) v(axis_name, from_value, to_value)
        WHERE v.from_value <> v.to_value
          AND NOT EXISTS (
              SELECT 1
              FROM pb.proposal_status_transition_rules r
              WHERE r.axis_name = v.axis_name
                AND r.from_value = v.from_value
                AND r.to_value = v.to_value
          )
    )
    BEGIN
        THROW 50021, 'Invalid proposal status transition detected.', 1;
    END

    INSERT INTO pb.proposal_status_history (proposal_id, axis_name, from_value, to_value, changed_at)
    SELECT i.id, v.axis_name, v.from_value, v.to_value, SYSUTCDATETIME()
    FROM inserted i
    JOIN deleted d ON i.id = d.id
    CROSS APPLY (VALUES
        ('lifecycle_stage', d.lifecycle_stage, i.lifecycle_stage),
        ('institutional_status', d.institutional_status, i.institutional_status),
        ('participation_status', d.participation_status, i.participation_status),
        ('selection_status', d.selection_status, i.selection_status),
        ('execution_status', d.execution_status, i.execution_status),
        ('impact_status', d.impact_status, i.impact_status)
    ) v(axis_name, from_value, to_value)
    WHERE v.from_value <> v.to_value;
END;
GO

CREATE TRIGGER pb.trg_proposals_phase_consistency
ON pb.proposals
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        CROSS APPLY (
            SELECT COUNT(*) AS active_count
            FROM pb.cycle_phases cp
            WHERE cp.cycle_id = i.cycle_id
              AND (cp.is_current = 1 OR SYSUTCDATETIME() BETWEEN cp.starts_at AND cp.ends_at)
        ) ac
        WHERE ac.active_count <> 1
    )
    BEGIN
        THROW 50022, 'Cycle must have exactly one active phase (is_current or current time window).', 1;
    END

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN pb.cycle_phases cp
          ON cp.cycle_id = i.cycle_id
         AND (cp.is_current = 1 OR SYSUTCDATETIME() BETWEEN cp.starts_at AND cp.ends_at)
        WHERE (cp.phase = 'proposal_submission' AND i.lifecycle_stage IN ('open_for_voting','voting_closed'))
           OR (cp.phase IN ('proposal_submission','institutional_evaluation','community_deliberation') AND i.participation_status = 'voting_open')
           OR (cp.phase IN ('discovery','proposal_submission','institutional_evaluation','community_deliberation','voting')
               AND i.selection_status = 'winning_project')
           OR (cp.phase IN ('discovery','proposal_submission','institutional_evaluation','community_deliberation','voting')
               AND i.execution_status <> 'not_started')
           OR (cp.phase = 'results_publication' AND i.participation_status = 'voting_open')
    )
    BEGIN
        THROW 50030, 'Proposal status is inconsistent with current cycle phase.', 1;
    END
END;
GO

CREATE TRIGGER pb.trg_discussion_entries_updated_at
ON pb.discussion_entries
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE de
    SET updated_at = SYSUTCDATETIME(),
        is_edited = CASE WHEN de.is_edited = 0 THEN 1 ELSE de.is_edited END
    FROM pb.discussion_entries de
    JOIN inserted i ON de.id = i.id;
END;
GO

CREATE TRIGGER pb.trg_institutional_reviews_apply_decision
ON pb.institutional_reviews
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN pb.proposals p ON p.id = i.proposal_id
        WHERE i.is_final = 1
          AND p.lifecycle_stage NOT IN ('officially_submitted','under_institutional_review','in_preparation')
    )
    BEGIN
        THROW 50023, 'Final institutional review can only be applied to submit/evaluation proposals.', 1;
    END

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN pb.proposals p ON p.id = i.proposal_id
        WHERE i.is_final = 0
          AND p.lifecycle_stage NOT IN ('officially_submitted','under_institutional_review','in_preparation','ready_for_deliberation')
    )
    BEGIN
        THROW 50031, 'Non-final review is not allowed for proposal lifecycle stage.', 1;
    END

    UPDATE p
    SET
        institutional_status =
            CASE i.decision
                WHEN 'approved' THEN 'approved'
                WHEN 'rejected' THEN 'rejected'
                WHEN 'needs_changes' THEN 'needs_changes'
                ELSE p.institutional_status
            END,
        lifecycle_stage =
            CASE i.decision
                WHEN 'approved' THEN 'ready_for_deliberation'
                WHEN 'rejected' THEN 'rejected'
                WHEN 'needs_changes' THEN 'in_preparation'
                ELSE p.lifecycle_stage
            END,
        participation_status =
            CASE i.decision
                WHEN 'approved' THEN 'discussion_open'
                ELSE 'not_open'
            END
    FROM pb.proposals p
    JOIN inserted i ON i.proposal_id = p.id
    WHERE i.is_final = 1;
END;
GO

CREATE TRIGGER pb.trg_votes_validate_insert
ON pb.votes
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @error_message NVARCHAR(2048);

    ;WITH row_validation AS (
        SELECT
            i.id,
            i.cycle_id,
            i.proposal_id,
            i.voter_id,
            CASE
                WHEN NOT EXISTS (
                    SELECT 1
                    FROM pb.cycle_phases cp
                    WHERE cp.cycle_id = i.cycle_id
                      AND cp.phase = 'voting'
                      AND (cp.is_current = 1 OR SYSUTCDATETIME() BETWEEN cp.starts_at AND cp.ends_at)
                ) THEN 'VOTING_PHASE_CLOSED'
                WHEN ISNULL(ve.is_eligible, 0) = 0 THEN 'VOTER_NOT_ELIGIBLE'
                WHEN p.id IS NULL THEN 'PROPOSAL_NOT_FOUND'
                WHEN p.cycle_id <> i.cycle_id THEN 'PROPOSAL_CYCLE_MISMATCH'
                WHEN p.institutional_status <> 'approved' THEN 'PROPOSAL_NOT_APPROVED'
                WHEN p.participation_status <> 'voting_open' THEN 'PROPOSAL_NOT_OPEN_FOR_VOTING'
                WHEN p.lifecycle_stage <> 'open_for_voting' THEN 'PROPOSAL_LIFECYCLE_INVALID'
                ELSE NULL
            END AS error_code
        FROM inserted i
        LEFT JOIN pb.voter_eligibility ve
          ON ve.cycle_id = i.cycle_id AND ve.user_id = i.voter_id
        LEFT JOIN pb.proposals p ON p.id = i.proposal_id
    )
    SELECT TOP 1
        @error_message = CONCAT(
            'Vote row validation failed [', error_code, '] cycle=',
            CONVERT(NVARCHAR(36), cycle_id), ', proposal=', CONVERT(NVARCHAR(36), proposal_id),
            ', voter=', CONVERT(NVARCHAR(36), voter_id)
        )
    FROM row_validation
    WHERE error_code IS NOT NULL;

    IF @error_message IS NOT NULL
    BEGIN
        THROW 50024, @error_message, 1;
    END

    INSERT INTO pb.votes (id, cycle_id, proposal_id, voter_id, cast_at, client_fingerprint, receipt_hash)
    SELECT ISNULL(i.id, NEWID()), i.cycle_id, i.proposal_id, i.voter_id,
           ISNULL(i.cast_at, SYSUTCDATETIME()), i.client_fingerprint, i.receipt_hash
    FROM inserted i;
END;
GO

CREATE TRIGGER pb.trg_winning_projects_sync_selection
ON pb.winning_projects
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN pb.proposals p ON p.id = i.proposal_id
        WHERE p.cycle_id <> i.cycle_id
           OR p.participation_status <> 'voting_closed'
           OR p.institutional_status <> 'approved'
    )
    BEGIN
        THROW 50027, 'Winning project selection is inconsistent with proposal state.', 1;
    END

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE NOT EXISTS (
            SELECT 1
            FROM pb.cycle_phases cp
            WHERE cp.cycle_id = i.cycle_id
              AND cp.phase = 'results_publication'
              AND (cp.is_current = 1 OR SYSUTCDATETIME() BETWEEN cp.starts_at AND cp.ends_at)
        )
    )
    BEGIN
        THROW 50028, 'Winning projects can only be announced during results publication phase.', 1;
    END

    UPDATE p
    SET selection_status = 'winning_project'
    FROM pb.proposals p
    JOIN inserted i ON i.proposal_id = p.id;
END;
GO

CREATE TRIGGER pb.trg_execution_updates_sync_status
ON pb.execution_updates
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN pb.proposals p ON p.id = i.proposal_id
        WHERE p.selection_status <> 'winning_project'
    )
    BEGIN
        THROW 50029, 'Execution updates are only allowed for winning projects.', 1;
    END

    UPDATE p
    SET execution_status =
        CASE
            WHEN i.progress_percent >= 100 THEN 'completed'
            WHEN i.progress_percent > 0 THEN 'in_progress'
            ELSE p.execution_status
        END,
        impact_status =
        CASE
            WHEN i.progress_percent >= 100 THEN 'monitoring'
            ELSE p.impact_status
        END
    FROM pb.proposals p
    JOIN inserted i ON i.proposal_id = p.id;
END;
GO

/* =========================================
   Read-model views (counts are source-derived)
   ========================================= */
CREATE VIEW pb.v_proposal_public_summary
AS
SELECT
    p.id,
    p.cycle_id,
    p.title,
    p.description,
    p.lifecycle_stage,
    p.institutional_status,
    p.participation_status,
    p.selection_status,
    p.execution_status,
    p.impact_status,
    p.budget_requested,
    p.people_benefited_estimated,
    p.created_at,
    c.name AS category_name,
    n.name AS neighborhood_name,
    u.full_name AS author_name,
    ISNULL(v.vote_count, 0) AS votes_count,
    ISNULL(cm.comment_count, 0) AS comments_count
FROM pb.proposals p
LEFT JOIN pb.categories c ON c.id = p.category_id
LEFT JOIN pb.neighborhoods n ON n.id = p.neighborhood_id
LEFT JOIN pb.users u ON u.id = p.author_id
OUTER APPLY (
    SELECT COUNT(*) AS vote_count
    FROM pb.votes v
    WHERE v.proposal_id = p.id
) v
OUTER APPLY (
    SELECT COUNT(*) AS comment_count
    FROM pb.discussion_threads dt
    JOIN pb.discussion_entries de ON de.thread_id = dt.id
    WHERE dt.proposal_id = p.id
) cm;
GO

CREATE VIEW pb.v_results_publication
AS
SELECT
    wp.rank_position,
    p.id AS proposal_id,
    p.title,
    p.description,
    p.execution_status,
    p.impact_status,
    ISNULL(v.vote_count, 0) AS votes_count,
    wp.approved_budget,
    wp.announced_at,
    n.name AS neighborhood_name,
    c.name AS category_name
FROM pb.winning_projects wp
JOIN pb.proposals p ON p.id = wp.proposal_id
LEFT JOIN pb.neighborhoods n ON n.id = p.neighborhood_id
LEFT JOIN pb.categories c ON c.id = p.category_id
OUTER APPLY (
    SELECT COUNT(*) AS vote_count
    FROM pb.votes v
    WHERE v.proposal_id = p.id
) v;
GO

/* =========================================
   Seed minimal roles
   ========================================= */
MERGE pb.roles AS target
USING (VALUES
    ('admin', 'Administrator'),
    ('moderator', 'Moderator'),
    ('evaluator', 'Institutional Evaluator'),
    ('citizen', 'Citizen')
) AS src(role_code, role_name)
ON target.role_code = src.role_code
WHEN MATCHED THEN UPDATE SET role_name = src.role_name
WHEN NOT MATCHED THEN INSERT (id, role_code, role_name)
VALUES (NEWID(), src.role_code, src.role_name);
GO
