// Shared Supabase auth helpers.
let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SITE_CONFIG.supabaseUrl, SITE_CONFIG.supabaseAnonKey);
} catch (e) { console.warn("Supabase is not configured.", e); }

function studentIdToEmail(studentId) {
  return `${studentId.trim().toLowerCase()}@${SITE_CONFIG.studentEmailDomain}`;
}
function normalizeIdentifier(identifier) {
  const value = String(identifier || "").trim();
  if (value.includes("@")) return value.toLowerCase();
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}@${SITE_CONFIG.studentEmailDomain}`;
  if (digits.length === 12 && digits.startsWith("91")) return `${digits}@${SITE_CONFIG.studentEmailDomain}`;
  return value.toLowerCase();
}
function _authT(key, en) { return typeof t === "function" ? t(key) : en; }

async function loginWithIdentifier(identifier, password) {
  if (!identifier || !password) return {ok:false,message:"Please enter your email ID and password."};
  if (!supabaseClient) return {ok:false,message:"Login isn't available yet. Please try again later."};
  try {
    const {data,error}=await supabaseClient.auth.signInWithPassword({email:normalizeIdentifier(identifier),password});
    if(error) return {ok:false,message:"Incorrect email ID or password."};
    return {ok:true,session:data.session};
  } catch(e) { return {ok:false,message:"Something went wrong. Please try again."}; }
}
async function loginWithStudentId(studentId,password) {
  return loginWithIdentifier(studentIdToEmail(studentId),password);
}
async function registerAccount(fullName,identifier,password) {
  if(!fullName.trim() || !identifier.trim() || !password) return {ok:false,message:"Please fill all fields."};
  if(password.length<6) return {ok:false,message:"Password must be at least 6 characters."};
  if(!supabaseClient) return {ok:false,message:"Registration isn't available yet. Please try again later."};
  const authEmail=normalizeIdentifier(identifier);
  try {
    const {data,error}=await supabaseClient.auth.signUp({
      email:authEmail,password,
      options:{data:{full_name:fullName.trim(),contact_identifier:identifier.trim()}}
    });
    if(error) {
      const msg=(error.message||"").toLowerCase();
      if(msg.includes("already registered")||msg.includes("already exists")) return {ok:false,message:"This email is already registered. Please login."};
      return {ok:false,message:error.message||"Unable to create account."};
    }
    return {ok:true,session:data.session,message:data.session?"Account created successfully.":"Account created. Please check your email to confirm your account."};
  } catch(e) { return {ok:false,message:"Unable to create account. Please try again."}; }
}
async function resendConfirmation(email) {
  if(!email || !email.includes("@")) return {ok:false,message:"Please enter the registered email address."};
  if(!supabaseClient) return {ok:false,message:"Email confirmation isn't available yet. Please try again later."};
  try {
    const {error}=await supabaseClient.auth.resend({type:"signup",email:email.trim().toLowerCase()});
    if(error) return {ok:false,message:error.message||"Unable to resend the confirmation email."};
    return {ok:true,message:"Confirmation email sent again. Please check Inbox, Spam and Promotions."};
  } catch(e) { return {ok:false,message:"Unable to resend the confirmation email. Please try again."}; }
}
async function sendPasswordReset(email) {
  if(!email || !email.includes("@")) return {ok:false,message:"Please enter a valid registered email address."};
  if(!supabaseClient) return {ok:false,message:"Password reset isn't available yet. Please try again later."};
  try {
    const {error}=await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:"https://tettesthub.in/reset-password.html"});
    if(error) return {ok:false,message:error.message||"Unable to send the reset link."};
    return {ok:true,message:"Reset link sent. Please check your email inbox and spam folder."};
  } catch(e) { return {ok:false,message:"Unable to send the reset link. Please try again."}; }
}
async function updatePassword(password) {
  if(!supabaseClient) return {ok:false,message:"Password update isn't available yet."};
  if(!password || password.length<6) return {ok:false,message:"Password must be at least 6 characters."};
  try {
    const {error}=await supabaseClient.auth.updateUser({password});
    if(error) return {ok:false,message:error.message||"Unable to update password."};
    return {ok:true,message:"Password updated successfully."};
  } catch(e) { return {ok:false,message:"Unable to update password. Please try again."}; }
}
async function logout(){try{localStorage.removeItem("tth_user")}catch(e){}if(!supabaseClient)return;try{await supabaseClient.auth.signOut()}catch(e){}}
async function getSession(){if(!supabaseClient)return null;try{const {data}=await supabaseClient.auth.getSession();return data.session||null}catch(e){return null}}
async function getProfile(userId){
 if(!supabaseClient)return null;
 try{const {data,error}=await supabaseClient.from("profiles").select("student_id, full_name, package, purchased_tests, status").eq("id",userId).single();if(error)return null;try{localStorage.setItem("tth_user",JSON.stringify({id:data.student_id,name:data.full_name}))}catch(e){}return data}catch(e){return null}
}
async function requireAuth(){
 const session=await getSession();
 if(!session){const next=encodeURIComponent(location.pathname.split("/").pop()||"dashboard.html");location.replace(`login.html?next=${next}`);return null}
 return session;
}
function canAccessTest(testId,profile){
 if(!profile)return false;
 if(FREE_TESTS&&FREE_TESTS.includes(testId))return profile.status==="active";
 return profile.status==="active"&&(profile.purchased_tests||[]).includes(testId);
}
