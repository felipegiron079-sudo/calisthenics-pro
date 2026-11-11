import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

type Props = { onClose: () => void };

export default function AuthScreen({ onClose }: Props) {
 const [mode,setMode]=useState<"login"|"register">("login");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [sessionEmail,setSessionEmail]=useState<string|null>(null);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  if(!supabase) return;
  supabase.auth.getSession().then(({data})=>setSessionEmail(data.session?.user.email??null));
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setSessionEmail(session?.user.email??null));
  return ()=>subscription.unsubscribe();
 },[]);
 const submit=async()=>{
  const cleanEmail=email.trim().toLowerCase();
  if(!cleanEmail||!cleanEmail.includes("@")){Alert.alert("Revisa tu correo","Escribe un correo electrónico válido.");return;}
  if(password.length<6){Alert.alert("Contraseña muy corta","Usa al menos 6 caracteres.");return;}
  if(!supabase){Alert.alert("Conexión pendiente","La pantalla de cuentas ya está preparada, pero falta configurar las claves públicas de Supabase. Lo haremos al conectar la base de datos.");return;}
  setBusy(true);setMessage("");
  try{
   if(mode==="register"){
    const {data,error}=await supabase.auth.signUp({email:cleanEmail,password});
    if(error) throw error;
    if(data.session){setSessionEmail(data.user?.email??cleanEmail);Alert.alert("Cuenta creada","Tu cuenta está lista.");}
    else setMessage("Registro enviado. Revisa tu correo para confirmar la cuenta y después inicia sesión.");
   }else{
    const {data,error}=await supabase.auth.signInWithPassword({email:cleanEmail,password});
    if(error) throw error;
    setSessionEmail(data.user.email??cleanEmail);
    Alert.alert("¡Bienvenido!","Has iniciado sesión correctamente.");
   }
  }catch(error){Alert.alert("No se pudo completar",error instanceof Error?error.message:"Inténtalo de nuevo.");}
  finally{setBusy(false);}
 };
 const recoverPassword=async()=>{
  const cleanEmail=email.trim().toLowerCase();
  if(!cleanEmail||!cleanEmail.includes("@")){Alert.alert("Escribe tu correo","Necesitamos tu correo para enviarte el enlace de recuperación.");return;}
  if(!supabase){Alert.alert("Conexión pendiente","La recuperación estará disponible cuando configuremos Supabase.");return;}
  setBusy(true);
  try{
   const {error}=await supabase.auth.resetPasswordForEmail(cleanEmail);
   if(error) throw error;
   Alert.alert("Correo enviado","Si la cuenta existe, recibirás un mensaje con los pasos para recuperar tu contraseña. Revisa también spam.");
  }catch(error){Alert.alert("No se pudo enviar",error instanceof Error?error.message:"Inténtalo de nuevo.");}
  finally{setBusy(false);}
 };
 const logout=async()=>{if(!supabase)return;setBusy(true);const {error}=await supabase.auth.signOut();setBusy(false);if(error)Alert.alert("Error",error.message);else setSessionEmail(null);};
 return <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
  <TouchableOpacity onPress={onClose} style={s.back}><Ionicons name="arrow-back" size={20} color="#111"/><Text style={s.backText}>VOLVER AL PERFIL</Text></TouchableOpacity>
  <View style={s.logo}><Ionicons name="person-circle-outline" size={42} color="#111"/></View>
  <Text style={s.kicker}>CALISTHENICS PRO</Text><Text style={s.title}>{sessionEmail?"Tu cuenta":mode==="login"?"Bienvenido de nuevo":"Crea tu cuenta"}</Text>
  {sessionEmail?<><Text style={s.copy}>Sesión iniciada con</Text><Text style={s.email}>{sessionEmail}</Text><Text style={s.copy}>La sincronización de tu progreso en la nube se conectará en el siguiente paso.</Text><TouchableOpacity disabled={busy} style={s.primary} onPress={logout}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.primaryText}>CERRAR SESIÓN</Text>}</TouchableOpacity></>:<>
   <Text style={s.copy}>Guarda tu cuenta y prepara tu progreso para sincronizarlo entre dispositivos.</Text>
   <View style={s.switch}><TouchableOpacity onPress={()=>{setMode("login");setMessage("");}} style={[s.switchItem,mode==="login"&&s.active]}><Text style={[s.switchText,mode==="login"&&s.activeText]}>INICIAR SESIÓN</Text></TouchableOpacity><TouchableOpacity onPress={()=>{setMode("register");setMessage("");}} style={[s.switchItem,mode==="register"&&s.active]}><Text style={[s.switchText,mode==="register"&&s.activeText]}>REGISTRARSE</Text></TouchableOpacity></View>
   <Text style={s.label}>CORREO ELECTRÓNICO</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="tu correo electrónico" placeholderTextColor="#888" style={s.input}/>
   <Text style={s.label}>CONTRASEÑA</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={mode==="login"?"current-password":"new-password"} placeholder="Mínimo 6 caracteres" placeholderTextColor="#888" style={s.input}/>
   <TouchableOpacity disabled={busy} onPress={submit} style={s.primary}>{busy?<ActivityIndicator color="#fff"/>:<Text style={s.primaryText}>{mode==="login"?"INICIAR SESIÓN":"CREAR CUENTA"}</Text>}</TouchableOpacity>
   {!!message&&<Text style={s.message}>{message}</Text>}\n   {mode==="login"&&<TouchableOpacity disabled={busy} onPress={recoverPassword} style={{paddingVertical:16,alignItems:"center"}}><Text style={{fontSize:11,fontWeight:"800",color:"#333",textDecorationLine:"underline"}}>¿OLVIDASTE TU CONTRASEÑA?</Text></TouchableOpacity>}
   {!supabase&&<View style={s.notice}><Ionicons name="cloud-offline-outline" size={19} color="#111"/><Text style={s.noticeText}>La conexión de Supabase todavía no está configurada. Esta pantalla está preparada; activaremos las cuentas cuando conectemos la base de datos.</Text></View>}
  </>}
 </ScrollView>;
}
const s=StyleSheet.create({
 container:{padding:22,paddingBottom:50,flexGrow:1,backgroundColor:"#F7F7F7"},
 back:{flexDirection:"row",alignItems:"center",gap:9,marginBottom:34},backText:{fontSize:10,fontWeight:"900",letterSpacing:1,color:"#333"},
 logo:{width:76,height:76,borderRadius:22,backgroundColor:"#EAEAEA",alignItems:"center",justifyContent:"center",marginBottom:22},
 kicker:{fontSize:10,fontWeight:"900",letterSpacing:2,color:"#666"},title:{fontSize:30,fontWeight:"900",color:"#111",marginTop:8},copy:{fontSize:13,color:"#666",lineHeight:20,marginTop:12,marginBottom:20},
 switch:{flexDirection:"row",backgroundColor:"#EAEAEA",borderRadius:12,padding:4,marginBottom:24},switchItem:{flex:1,padding:12,alignItems:"center",borderRadius:9},active:{backgroundColor:"#111"},switchText:{fontSize:10,fontWeight:"900",color:"#555"},activeText:{color:"#fff"},
 label:{fontSize:10,fontWeight:"900",letterSpacing:1,color:"#333",marginBottom:8,marginTop:12},input:{backgroundColor:"#fff",borderWidth:1,borderColor:"#ddd",borderRadius:12,padding:15,color:"#111",fontSize:14},
 primary:{backgroundColor:"#111",borderRadius:13,padding:17,alignItems:"center",marginTop:24,minHeight:54,justifyContent:"center"},primaryText:{fontSize:11,fontWeight:"900",letterSpacing:1,color:"#fff"},
 message:{fontSize:12,color:"#333",lineHeight:19,marginTop:15},notice:{flexDirection:"row",gap:10,backgroundColor:"#EAEAEA",padding:14,borderRadius:12,marginTop:22},noticeText:{flex:1,fontSize:11,color:"#444",lineHeight:17},
 email:{fontSize:15,fontWeight:"800",color:"#111",marginTop:-12,marginBottom:12}
});
