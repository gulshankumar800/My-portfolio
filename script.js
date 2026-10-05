 // script.js

// 1. Loading Screen Logic
window.addEventListener("load", function () {
    setTimeout(function () {
        const loader = document.getElementById("loader");
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 1000);
    }, 2000); // 2 seconds tak loader dikhega
});

// 2. Custom Cursor Logic (Mouse ki jagah gol ghera)
const cursor = document.querySelector(".cursor");

document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
});

// Cursor bada karna jab kisi Link ya Button par jaye
const links = document.querySelectorAll("a, .btn");

links.forEach(link => {
    link.addEventListener("mouseenter", () => {
        cursor.style.width = "50px";
        cursor.style.height = "50px";
        cursor.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    });
    link.addEventListener("mouseleave", () => {
        cursor.style.width = "20px";
        cursor.style.height = "20px";
        cursor.style.backgroundColor = "transparent";
    });
});