const {join} = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const Logger = require('../misc/Logger');
const User = require('./Use
const Tweet = require('./Tweet');

let {rename} = require('fs');
const {promisify} = require('util');
rename = promisify(rename);

/**
 * Utility class for interacting with the MySQL database.
 */
class Database {
	/**
	 * @param {string} host Hostname of the database.
	 * @param {string} user User to connect to the database with.
	 * @param {string} password Password of the given user.
	 */
	constructor(host, user, password) {
		this.host = host;
		this.user = user;
		this.password = password;
		this.connection = null;
		this.log = new Logger('Database');
	}

	/**
	 * Connects to the database.
	 */
	async connect() {
		this.connection = await mysql.createConnection({
			host: this.host,
			user: this.user,
			password: this.password,
			database: 'retweet'
		});
	}

	/**
	 * Generates an id not already in the database.
	 * @returns {Promise<string>} Generated id.
	 */
	async generateId() {
		const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
		const id = Array(16)
			.fill()
			.map(() => chars[Math.floor(Math.random() * chars.length)])
			.join('');
		// Checks if the id is already in the database.
		const [rows] = await this.connection.query('SELECT * FROM id WHERE id = ? ', [id]);
		if (rows.length !== 0)
			return await this.generateId();
		return id;
	}

	/**
	 * Gets a user from the database by id.
	 * @param {string} id Id of user to get.
	 * @returns {Promise<?User>} User with given id. `null` if not found.
	 **/
	async getUserById(id) {
		const [rows] = await this.connection.query('SELECT * FROM user WHERE id = ?', [id]);
		if (rows.length === 0)
			return null;
		return new User(rows[0], this);
	}

	/**
	 * Gets an user from the database by username.
	 * @param {string} username Username of user to get.
	 * @returns {Promise<?User>} User with given username. `null` if not found.
	 **/
	async getUser(username) {
		const [rows] = await this.connection.query('SELECT * FROM user WHERE username= ? ', [username]);
		if (rows.length === 0)
			return null;
		return new User(rows[0], this);
	}

	async getTweet(id) {
		const [rows] = await this.connection.query('SELECT * FROM tweet WHERE id = ?', [id]);
		if (rows.length === 0)
			return null;
		return new Tweet(rows[0], this);
	}

	/**
	 * Inserts a User in the database.
	 * @param {object} data Required data to create the user.
	 * @param {string} data.username The username of the user.
	 * @param {string} data.email The e-mail of the user.
	 * @param {string} data.password The clear password of the user. Will be encrypted in this function.
	 * @returns {User} The generated user object.
	 */
	async addUser(data) {
		const id = await this.generateId();
		const createdAt = new Date();
		const encrypted = await bcrypt.hash(data.password, 10);
		await this.connection.query('INSERT INTO User (id, username, email,  password, created_at, follows, followers, likes) VALUES (?, ?, ?, ?, ?, \'[]\', \'[]\', \'[]\')',
			[id, data.username, data.email, encrypted, createdAt]);
		await this.connection.query('INSERT INTO Id VALUES (?,?,?)', [id, createdAt, 0]);
		this.log.info(`[${id}] Created user ${data.username}`);
		return new User({
			id,
			username: data.username,
			email: data.email,
			password: encrypted,
			created_at: createdAt,
			follows: [],
			followers: [],
			likes: []
		}, this);
	}

	/**
	 * Inserts a Tweet in the database.
	 * @param {object} data Required data to create the tweet.
	 * @param {string} data.content The content of the tweet.
	 * @param {string} data.authorId The id of the author of the tweet.
	 * @param {?string} data.mediaId The id of the media attached to the tweet.
	 * @param {?string} data.repliesTo The id of the tweet to which this tweet replies.
	 * @param {?string} data.id The id of the tweet, if generated beforehand.
	 * @returns {Tweet} The generated tweet object.
	 */
	async addTweet(data) {
		const id = data.id || await this.generateId();
		const createdAt = new Date();
		this.log.info(`Created tweet ${id}`);
		await this.connection.query('INSERT INTO Id VALUES (?,?,?)', [id, createdAt, 1]);
		await this.connection.query('INSERT INTO Tweet VALUES (?, ?, ?, ?, ?, ?, \'[]\', \'[]\', \'[]\', 0)',
			[id, data.content, data.authorId, data.mediaId, createdAt, data.repliesTo]);
		return new Tweet({
			id,
			content: data.content,
			author_id: data.authorId,
			media_id: data.mediaId,
			created_at: createdAt,
			replies_to: data.repliesTo,
			likes: [],
			replies: [],
			retweets: []
		}, this);
	}

	async addMedia(path, data) {
		const id = await this.generateId();
		const createdAt = new Date();
		const dbType = (data.type === 'tweet') ? 2 : (data.type === 'banner') ? 1 : 0;
		const newPath = join(__dirname, '../../..', 'media', id + '.jpg');
		await rename(path, newPath);
		this.log.info(`Saved media ${id}`);
		if (data.type === 'tweet')
			await this.connection.query('INSERT INTO Media VALUES (?, ?, 2, NULL, ?, ?, 0)', [id, newPath, data.id, createdAt]);
		else
			await this.connection.query('INSERT INTO Media VALUES (?, ?, ?, ?, NULL, ?, 0)', [id, newPath, dbType, data.id, createdAt]);

		await this.connection.query('INSERT INTO Id VALUES (?, ?, 2)', [id, createdAt]);

		return id;
	}
}

module.exports = new Database(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD);