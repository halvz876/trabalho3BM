// 1. IMPORTAÇÕES DOS MÓDULOS DO FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAgTyyPHmDKoeiASGh986VboKoQ9EQNn38",
    authDomain: "bancodedados-6a371.firebaseapp.com",
    projectId: "bancodedados-6a371",
    storageBucket: "bancodedados-6a371.firebasestorage.app",
    messagingSenderId: "982595529125",
    appId: "1:982595529125:web:cb819182abea81a94da04c",
    measurementId: "G-0GWC6KWSGW"
};

// 3. INICIALIZAÇÃO DOS SERVIÇOS
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================
// FUNCIONALIDADE 1: CADASTRO DE USUÁRIO
// ============================================================
document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("cadastroNome").value;
    const email = document.getElementById("cadastroEmail").value;
    const senha = document.getElementById("cadastroSenha").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email
        });

        alert("Usuário cadastrado com sucesso!");
        document.getElementById("formCadastro").reset();
    } catch (error) {
        alert("Erro ao cadastrar: " + error.message);
    }
});

// ============================================================
// FUNCIONALIDADE 2: LOGIN DE USUÁRIO
// ============================================================
document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        window.location.href = "site.html";
    } catch (error) {
        alert("Erro ao realizar login: " + error.message);
    }
});

// ============================================================
// FUNCIONALIDADE 3: SELEÇÃO E EDICÃO DE REGISTRO
// ============================================================
let usuarioEditandoUid = null;

// Botão para carregar dados do banco de dados
document.getElementById("btnCarregarDados").addEventListener("click", async () => {
    const email = document.getElementById("editEmailAuth").value;
    const senha = document.getElementById("editSenhaAuth").value;

    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha para autenticar.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        usuarioEditandoUid = userCredential.user.uid;

        const docRef = doc(db, "usuarios", usuarioEditandoUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            document.getElementById("editNome").value = docSnap.data().nome;
            document.getElementById("editNome").disabled = false;
            document.getElementById("btnAtualizar").disabled = false;
            alert("Dados carregados com sucesso! Agora você pode alterar o nome.");
        } else {
            alert("Dados não encontrados no Firestore.");
        }
    } catch (error) {
        alert("Erro ao autenticar/buscar dados: " + error.message);
    }
});

// Formulário para salvar as alterações no banco de dados
document.getElementById("formEditar").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usuarioEditandoUid) return;

    const novoNome = document.getElementById("editNome").value;

    try {
        const docRef = doc(db, "usuarios", usuarioEditandoUid);
        
        await updateDoc(docRef, {
            nome: novoNome
        });

        alert("Registro atualizado com sucesso no banco de dados!");
        document.getElementById("formEditar").reset();
        document.getElementById("editNome").disabled = true;
        document.getElementById("btnAtualizar").disabled = true;
        usuarioEditandoUid = null;
    } catch (error) {
        alert("Erro ao atualizar o registro: " + error.message);
    }
});

// ============================================================
// FUNCIONALIDADE 4: EXCLUIR CONTA COMPLETA (AUTH + FIRESTORE)
// ============================================================
document.getElementById("formDeletarContaPropria").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("deletarEmailAuth").value;
    const senha = document.getElementById("deletarSenhaAuth").value;

    if (!confirm("Tem certeza que deseja apagar permanentemente esta conta?")) {
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        await deleteDoc(doc(db, "usuarios", user.uid));
        await deleteUser(user);

        alert("Conta excluída permanentemente com sucesso!");
        document.getElementById("formDeletarContaPropria").reset();
    } catch (error) {
        alert("Erro ao excluir a conta: " + error.message);
    }
});