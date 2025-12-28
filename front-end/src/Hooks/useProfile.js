import authService from "../services/authService";

export const useProfile=() => {
    const [userData, setUserData] = useState({
    name: '',
    phone: '',
    child: '',
    bus: '',
    role: ''
  });

  const getInfo = async () => {
    try {
      const response = await authService.profile();
      setUserData(response.data.profil)
      console.log(response.data.profil)
     return userData;
    } catch (error) {

      Alert.alert("Erreur", "Erreur lors de recuperation d infos");
    }

  };
}