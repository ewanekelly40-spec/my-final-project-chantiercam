-- Base de données ChantierCam pour MySQL / MariaDB
CREATE DATABASE IF NOT EXISTS chantiercam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chantiercam;

-- 1. Chefs de chantier (Managers)
CREATE TABLE IF NOT EXISTS managers (
  id VARCHAR(64) PRIMARY KEY,
  role VARCHAR(32) NOT NULL DEFAULT 'manager',
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(191) DEFAULT NULL,
  phone VARCHAR(64) DEFAULT NULL,
  suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Chantiers / Projets
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  manager_id VARCHAR(64) NOT NULL,
  name VARCHAR(191) NOT NULL,
  location VARCHAR(191) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  budget DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ongoing',
  cover_url TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Utilisateurs rattachés au projet (Ouvriers & Clients)
CREATE TABLE IF NOT EXISTS project_users (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  role VARCHAR(32) NOT NULL, -- 'worker' | 'client'
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(64) DEFAULT NULL,
  address VARCHAR(191) DEFAULT NULL,
  id_number VARCHAR(64) DEFAULT NULL,
  position VARCHAR(128) DEFAULT NULL,
  emergency_contact VARCHAR(64) DEFAULT NULL,
  suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_user_role (project_id, role),
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Phases de construction
CREATE TABLE IF NOT EXISTS phases (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  name VARCHAR(191) NOT NULL,
  budget DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  order_index INT NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed'
  notes TEXT DEFAULT NULL,
  documents JSON DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_phase_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tâches
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  phase_id VARCHAR(64) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  assigned_to VARCHAR(64) DEFAULT NULL,
  priority VARCHAR(32) NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'refused' | 'in_progress' | 'submitted' | 'completed'
  due_date DATE DEFAULT NULL,
  proposal TEXT DEFAULT NULL,
  proof JSON DEFAULT NULL,
  history JSON DEFAULT NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_task_assigned (assigned_to),
  INDEX idx_task_phase (phase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Matériaux et Approvisionnements
CREATE TABLE IF NOT EXISTS materials (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  phase_id VARCHAR(64) DEFAULT NULL,
  name VARCHAR(191) NOT NULL,
  category VARCHAR(64) DEFAULT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1.00,
  unit VARCHAR(32) DEFAULT NULL,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  supplier JSON DEFAULT NULL,
  purchase_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_material_phase (phase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Paiements & Règlements
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  phase_id VARCHAR(64) DEFAULT NULL,
  user_id VARCHAR(64) DEFAULT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  date DATE DEFAULT NULL,
  mode VARCHAR(32) NOT NULL DEFAULT 'cash', -- 'cash' | 'bank_transfer' | 'mobile_money' | 'check'
  type VARCHAR(32) NOT NULL DEFAULT 'advance', -- 'advance' | 'partial' | 'full'
  period VARCHAR(64) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_payment_user (user_id),
  INDEX idx_payment_phase (phase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Journal d'avancement & Publications (Progress)
CREATE TABLE IF NOT EXISTS progress (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  phase_id VARCHAR(64) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  phase VARCHAR(191) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  media JSON DEFAULT NULL,
  date DATE DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_progress_phase (phase_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Documents du chantier
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  phase_id VARCHAR(64) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(64) DEFAULT NULL,
  file_size BIGINT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Rapports enregistrés
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  period VARCHAR(128) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  data JSON DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Messages de discussion
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  from_user VARCHAR(64) NOT NULL,
  to_user VARCHAR(64) NOT NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_msg_conv (project_id, from_user, to_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
