const initDatabase = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create Users table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstname TEXT,
          lastname TEXT,
          username TEXT UNIQUE,
          password TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME
        )
      `,
        (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
          }
        }
      );

      // Create Products table
      db.run(
        `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL DEFAULT 0,
          stock INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT (datetime('now')),
          updated_at DATETIME
        )
      `,
        (err) => {
          if (err) {
            console.error('Error creating products table:', err);
            reject(err);
          }
        }
      );

      // Add sample data if tables are empty
      db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
        if (err) {
          console.error('Error checking users:', err);
          reject(err);
          return;
        }

        if (result.count === 0) {
          const bcrypt = require('bcryptjs');
          const hashedPassword = bcrypt.hashSync('admin123', 8);

          // Use INSERT OR IGNORE so repeated runs won't throw a UNIQUE constraint
          // if the admin user already exists (safe idempotent migration).
          db.run(
            `
            INSERT OR IGNORE INTO users (firstname, lastname, username, password)
            VALUES (?, ?, ?, ?)
          `,
            ['Admin', 'User', 'admin', hashedPassword],
            (err) => {
              if (err) {
                // Log but don't reject - migration should be resilient
                console.error('Error creating admin user (ignored if duplicate):', err);
              }
            }
          );
        }
      });

      db.get('SELECT COUNT(*) as count FROM products', [], (err, result) => {
        if (err) {
          console.error('Error checking products:', err);
          reject(err);
          return;
        }

        if (result.count === 0) {
          const sampleProducts = [
            ['Laptop', 999.99, 10],
            ['Smartphone', 499.99, 15],
            ['Headphones', 79.99, 20]
          ];

          for (const [name, price, stock] of sampleProducts) {
            // INSERT OR IGNORE isn't necessary here since products have no unique
            // constraint, but we still log failures without rejecting migration.
            db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [name, price, stock], (err) => {
              if (err) console.error('Error inserting product:', name, err);
            });
          }
        }
      });

      resolve();
    });
  });
};

module.exports = initDatabase;
