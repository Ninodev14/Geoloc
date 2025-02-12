const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const swaggerSetup = require("./swagger");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

swaggerSetup(app);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

mongoose.connect("mongodb://localhost:27017/auth-system");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, required: false },
  isAdmin: { type: Boolean, default: false },
});

const GeocacheSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: String, required: true },
  description: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ["Facile", "Moyen", "Difficile"],
    required: true,
  },
  password: { type: String, required: false },
  validatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: { type: String, default: null },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  geocache: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Geocache",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", CommentSchema);

const Geocache = mongoose.model("Geocache", GeocacheSchema);
module.exports = Geocache;

const User = mongoose.model("User", UserSchema);
/**
 * @openapi
 * /register:
 *   post:
 *     summary: Inscription d'un utilisateur
 *     description: Crée un utilisateur avec un mot de passe hashé et une image de profil.
 *     parameters:
 *       - in: formData
 *         name: username
 *         type: string
 *         required: true
 *         description: Nom d'utilisateur
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *         description: Email de l'utilisateur
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *         description: Mot de passe de l'utilisateur
 *       - in: formData
 *         name: profileImage
 *         type: file
 *         required: false
 *         description: Image de profil de l'utilisateur
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       500:
 *         description: Erreur lors de l'inscription
 */
app.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const profileImage = req.file ? req.file.path : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profileImage,
    });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});
/**
 * @openapi
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur de se connecter en utilisant son email et mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un token
 *       400:
 *         description: Erreur de connexion (utilisateur non trouvé ou mot de passe incorrect)
 *       500:
 *         description: Erreur lors de la connexion
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      "SECRET_KEY",
      { expiresIn: "24h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res.status(401).json({ error: "Accès refusé (Token manquant)" });

  try {
    const verified = jwt.verify(token, "SECRET_KEY");
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Token invalide" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(302).redirect("/geoloc.html");
  }
  next();
};

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Récupérer le profil d'un utilisateur
 *     description: Permet à un utilisateur connecté de récupérer son profil.
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la récupération du profil
 */
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({
      user: {
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
          ? `uploads/${path.basename(user.profileImage)}`
          : null,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du profil" });
  }
});

/**
 * @openapi
 * /make-admin:
 *   post:
 *     summary: Promouvoir un utilisateur en administrateur
 *     description: Permet à un administrateur de promouvoir un utilisateur en tant qu'administrateur.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur à promouvoir
 *     responses:
 *       200:
 *         description: Utilisateur promu administrateur
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la promotion de l'utilisateur
 */
app.post("/make-admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.isAdmin = true;
    await user.save();
    res.json({ message: "Utilisateur promu administrateur" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la promotion de l'utilisateur" });
  }
});
/**
 * @openapi
 * /delete-user:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Permet à un administrateur de supprimer un utilisateur.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la suppression de l'utilisateur
 */
app.delete(
  "/delete-user",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res.status(404).json({ error: "Utilisateur non trouvé" });

      await User.deleteOne({ _id: user._id });
      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
  }
);

/**
 * @openapi
 * /edit-user:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Permet à un administrateur de modifier les informations d'un utilisateur.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur à modifier
 *               newUsername:
 *                 type: string
 *                 description: Nouveau nom d'utilisateur
 *               newIsAdmin:
 *                 type: boolean
 *                 description: Nouveau statut administrateur
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la modification de l'utilisateur
 */
app.put("/edit-user", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { email, newUsername, newIsAdmin } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (newUsername) user.username = newUsername;
    if (typeof newIsAdmin === "boolean") user.isAdmin = newIsAdmin;

    await user.save();
    res.json({ message: "Utilisateur modifié avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la modification de l'utilisateur" });
  }
});

/**
 * @openapi
 * /admin/user:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Permet à un administrateur de récupérer la liste de tous les utilisateurs.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       500:
 *         description: Erreur lors de la récupération des utilisateurs
 */
app.get("/admin/user", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "username email isAdmin");
    res.json({ users });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

const ownerOrAdminMiddleware = async (req, res, next) => {
  const geocacheId = req.params.id;

  const geocache = await Geocache.findById(geocacheId);

  if (!geocache) return res.status(404).json({ error: "Géocache non trouvée" });
  const user = await User.findById(req.user.userId);
  if (req.user.isAdmin || geocache.creator === user.username) {
    return next();
  }

  res.status(403).json({
    error: "Accès interdit (vous n'êtes pas le créateur ou administrateur)",
  });
};

/**
 * @openapi
 * /geocache/validate-password/{id}:
 *   post:
 *     summary: Valider une géocache en entrant le mot de passe
 *     description: Permet à un utilisateur de valider une géocache en entrant le mot de passe associé.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la géocache
 *       - in: body
 *         name: password
 *         required: true
 *         description: Mot de passe pour valider la géocache
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               description: Mot de passe de la géocache
 *     responses:
 *       200:
 *         description: Mot de passe valide, géocache validée
 *       400:
 *         description: Mot de passe incorrect
 *       404:
 *         description: Géocache non trouvée
 *       500:
 *         description: Erreur lors de la validation du mot de passe
 */
app.post(
  "/geocache/validate-password/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const geocacheId = req.params.id;
      const { password } = req.body;
      const geocache = await Geocache.findById(geocacheId);
      if (!geocache) {
        return res.status(404).json({ error: "Géocache non trouvée" });
      }

      if (!geocache.password) {
        return res
          .status(400)
          .json({ error: "Aucun mot de passe requis pour cette géocache" });
      }

      if (password !== geocache.password) {
        return res.status(400).json({ error: "Mot de passe incorrect" });
      }

      res.json({ message: "Mot de passe validé, géocache vue avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la validation du mot de passe" });
    }
  }
);

/**
 * @openapi
 * /geocache/{id}:
 *   put:
 *     summary: Mettre à jour une géocache
 *     description: Permet de modifier une géocache existante.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la géocache à mettre à jour
 *       - in: body
 *         name: updateData
 *         required: true
 *         description: Données à mettre à jour pour la géocache
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Le nom de la géocache
 *             description:
 *               type: string
 *               description: La description de la géocache
 *             latitude:
 *               type: number
 *               description: La latitude de la géocache
 *             longitude:
 *               type: number
 *               description: La longitude de la géocache
 *             difficulty:
 *               type: string
 *               description: Le niveau de difficulté de la géocache
 *             password:
 *               type: string
 *               description: Le mot de passe pour valider la géocache
 *     responses:
 *       200:
 *         description: Géocache mise à jour avec succès
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Géocache non trouvée
 *       500:
 *         description: Erreur lors de la mise à jour de la géocache
 */
app.put("/geocache/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de géocache invalide." });
    }

    const updatedGeocache = await Geocache.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedGeocache) {
      return res.status(404).json({ error: "Géocache non trouvée." });
    }

    res.json({
      message: "Géocache mise à jour avec succès",
      geocache: updatedGeocache,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la géocache :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @openapi
 * /geocache/{id}:
 *   delete:
 *     summary: Supprimer une géocache
 *     description: Permet de supprimer une géocache par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la géocache à supprimer
 *     responses:
 *       200:
 *         description: Géocache supprimée avec succès
 *       404:
 *         description: Géocache non trouvée
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur lors de la suppression de la géocache
 */
app.delete(
  "/geocache/:id",
  authMiddleware,
  ownerOrAdminMiddleware,
  async (req, res) => {
    try {
      const geocache = await Geocache.findById(req.params.id);
      if (!geocache) {
        return res.status(404).json({ error: "Géocache non trouvée" });
      }
      const user = await User.findById(req.user.userId);
      if (geocache.creator !== user.username && !req.user.isAdmin) {
        return res.status(403).json({ error: "Accès refusé" });
      }

      await Geocache.deleteOne({ _id: geocache._id });
      res.json({ message: "Géocache supprimée avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de la géocache" });
    }
  }
);

/**
 * @openapi
 * /geocache:
 *   post:
 *     summary: Ajouter une nouvelle géocache
 *     description: Permet de créer une nouvelle géocache.
 *     parameters:
 *       - in: body
 *         name: geocache
 *         required: true
 *         description: Données de la géocache à ajouter
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             creator:
 *               type: string
 *             description:
 *               type: string
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             difficulty:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: Géocache créée avec succès
 *       500:
 *         description: Erreur lors de l'ajout de la géocache
 */
app.post("/geocache", async (req, res) => {
  try {
    const {
      name,
      creator,
      description,
      latitude,
      longitude,
      difficulty,
      password,
    } = req.body;
    const geocache = new Geocache({
      name,
      creator,
      description,
      latitude,
      longitude,
      difficulty,
      password,
    });
    await geocache.save();
    res.status(201).json(geocache);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout de la géocache" });
  }
});

/**
 * @openapi
 * /geocache/{id}:
 *   get:
 *     summary: Obtenir une géocache par ID
 *     description: Permet d'obtenir les détails d'une géocache en utilisant son ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la géocache
 *     responses:
 *       200:
 *         description: Géocache trouvée
 *       404:
 *         description: Géocache non trouvée
 */
app.get("/geocache/:id", authMiddleware, async (req, res) => {
  const geocache = await Geocache.findById(req.params.id);
  if (!geocache) {
    return res.status(404).json({ error: "Géocache non trouvée" });
  }
  res.json({ geocache });
});

/**
 * @openapi
 * /geocache:
 *   get:
 *     summary: Obtenir toutes les géocaches
 *     description: Permet d'obtenir toutes les géocaches disponibles.
 *     responses:
 *       200:
 *         description: Liste des géocaches
 */
app.get("/geocache", async (req, res) => {
  try {
    const geocaches = await Geocache.find();
    res.json(geocaches);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des géocaches" });
  }
});
const getValidatedGeocachesForUser = async (userId) => {
  try {
    const geocaches = await Geocache.find({ validatedBy: userId });
    return geocaches;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des géocaches validées:",
      error
    );
    throw error;
  }
};
/**
 * @openapi
 * /validated-geocaches:
 *   get:
 *     summary: Obtenir les géocaches validées par l'utilisateur
 *     description: Permet d'obtenir les géocaches validées par un utilisateur authentifié.
 *     responses:
 *       200:
 *         description: Liste des géocaches validées
 *       500:
 *         description: Erreur serveur
 */
app.get("/validated-geocaches", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const validatedGeocaches = await getValidatedGeocachesForUser(userId);

    res.json(validatedGeocaches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @openapi
 * /validate-geocache/{id}:
 *   post:
 *     summary: Valider une géocache par un utilisateur
 *     description: Permet à un utilisateur de valider une géocache en entrant un mot de passe ou de confirmer la validation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de la géocache à valider
 *       - in: body
 *         name: password
 *         required: true
 *         description: Mot de passe pour valider la géocache
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Géocache validée avec succès
 *       400:
 *         description: Code incorrect
 *       404:
 *         description: Géocache non trouvée
 *       500:
 *         description: Erreur lors de la validation de la géocache
 */
app.post("/validate-geocache/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const userId = req.user.userId;

  const geocache = await Geocache.findById(id);
  if (!geocache) {
    return res.status(404).json({ error: "Géocache non trouvée." });
  }

  if (geocache.password && geocache.password !== password) {
    return res.status(400).json({ error: "Code incorrect." });
  }

  if (geocache.validatedBy.includes(userId)) {
    return res
      .status(400)
      .json({ error: "Vous avez déjà validé cette géocache." });
  }

  geocache.validatedBy.push(userId);
  await geocache.save();

  res.json({ message: "Géocache validée avec succès." });
});

/**
 * @openapi
 * /comment/{geocacheId}:
 *   post:
 *     summary: Ajouter un commentaire à une géocache
 *     description: Permet à un utilisateur de commenter une géocache.
 *     parameters:
 *       - in: path
 *         name: geocacheId
 *         required: true
 *         description: L'ID de la géocache à commenter
 *       - in: body
 *         name: comment
 *         required: true
 *         description: Contenu du commentaire
 *         schema:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *     responses:
 *       201:
 *         description: Commentaire ajouté avec succès
 *       500:
 *         description: Erreur lors de l'ajout du commentaire
 */

app.post(
  "/comment/:geocacheId",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { text } = req.body;
      const geocacheId = req.params.geocacheId;

      // Vérifier si la géocache existe
      const geocache = await Geocache.findById(geocacheId);
      if (!geocache) {
        return res.status(404).json({ error: "Géocache non trouvée" });
      }

      if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      // 📌 Sauvegarder l'image si elle est envoyée
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const newComment = new Comment({
        text,
        image: imageUrl, // Ajout de l'URL de l'image au commentaire
        creator: req.user.userId,
        geocache: geocacheId,
      });

      await newComment.save();

      res.status(201).json({
        message: "Commentaire ajouté avec succès",
        comment: newComment,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
    }
  }
);

/**
 * @openapi
 * /comment/{geocacheId}:
 *   get:
 *     summary: Obtenir les commentaires d'une géocache
 *     description: Permet de récupérer les commentaires associés à une géocache.
 *     parameters:
 *       - in: path
 *         name: geocacheId
 *         required: true
 *         description: L'ID de la géocache pour récupérer les commentaires
 *     responses:
 *       200:
 *         description: Liste des commentaires
 *       500:
 *         description: Erreur lors du chargement des commentaires
 */
app.get("/comment/:geocacheId", async (req, res) => {
  try {
    const geocacheId = req.params.geocacheId;
    const comments = await Comment.find({ geocache: geocacheId }).populate(
      "creator",
      "username"
    );

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erreur lors du chargement des commentaires" });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Serveur en écoute sur http://localhost:${PORT}`)
);
