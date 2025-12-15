import { StyleSheet } from 'react-native';

const LoginStyles = StyleSheet.create({
  // Le fond doit être géré par l'image de fond dans le composant,
  // mais nous allons améliorer l'overlay.
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // 1. Overlay plus transparent et plus bleu foncé/vert pour mieux se fondre
  // avec l'image de fond et laisser transparaître les couleurs vives du bus/école.
  overlay: {
    flex: 1,
    // Légère modification: rgba(44, 62, 80, 0.4) pour un ton plus sombre et discret.
    backgroundColor: 'rgba(44, 62, 80, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Bouton de retour : Garder le blanc pour le contraste.
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  back: {
    // Couleur légèrement plus douce que le noir pur
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
  },
  // 2. Texte de bienvenue : Blanc ou couleur très claire pour contraster avec l'overlay sombre.
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    // Changement : 'white' ou un très clair (ex: #ecf0f1). On choisit 'white'.
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  // 3. Sous-titre : Blanc transparent pour une lisibilité douce.
  subtitle: {
    fontSize: 16,
    // Changement : Couleur claire, par exemple '#bdc3c7' (gris-bleu clair) ou 'rgba(255, 255, 255, 0.9)'.
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    // Les styles d'entrée (input) eux-mêmes devront être gérés dans le composant
    // pour avoir un fond blanc et une bordure claire comme sur l'image.
  },
  buttonContainer: {
    width: '100%',
    marginTop: 30,
  },
  // 4. Bouton de connexion : Utiliser un bleu vif/cyan similaire à celui de l'image.
  loginButton: {
    // Changement : Utilisation du bleu de l'image (qui semble être un #3498db).
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    // Garder l'ombre pour la profondeur.
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, // Légère augmentation pour plus de pep.
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  // 5. Mot de passe oublié (Lien) : Le même bleu vif pour l'uniformité.
  forgotPassword: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
    // Ajout d'une ombre de texte légère pour le rendre plus visible sur le fond.
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // 6. Texte 'Pas encore de compte ?' : Blanc ou gris très clair.
  signupText: {
    // Changement : Blanc ou gris clair pour la visibilité.
    color: 'white', 
    fontSize: 16,
  },
  // 7. Lien d'inscription : Le même bleu vif/cyan pour le contraste.
  signupLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    // Non visible dans l'image, mais utile si on ajoute un logo.
  },
});

export default LoginStyles;