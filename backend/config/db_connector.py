"""
Database connector configuration
This module ensures PyMySQL is properly installed as a MySQLdb replacement
"""
import pymysql

# Install PyMySQL as MySQLdb
pymysql.install_as_MySQLdb()