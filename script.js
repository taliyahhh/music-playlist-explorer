document.addEventListener("DOMContentLoaded", () => { // add event listener when page loads

   const featuredBtn = document.getElementById("featuredBtn");
   const homeBtn = document.getElementById("homeBtn");

   // header underline
   if(window.location.pathname.includes("index.html")){
      homeBtn.classList.add("currentPage");
      
   }else{
      featuredPage();
      featuredBtn.classList.add("currentPage");
      return;
   }

   let shuffleOrder = null;
   let currentPlaylistName = null;

   const modal = document.getElementById("playlist_modal");
   const container = document.getElementById("container");
   const modalArt = document.getElementById("playlist_art");
   const modalName = document.getElementById("playlist_name");
   const modalAuthor = document.getElementById("playlist_creator");
   const modalSongs = document.getElementById("songs");
   let playlistsData = null;

   const closeBtn = modal.querySelector(".close");
   const shuffleBtn = document.getElementById("shuffle");
   let currentSongs = [];


 // 1) Load playlists via fetch().then() chaining
fetch("data/data.json")
.then((response) => {
if (!response.ok) {
   throw new Error("Network error: " + response.status);
}
return response.json();
})
.then((data) => {
   playlistsData = data.playlists;
   data.playlists.forEach(createPlaylistTile);
})
.catch((err) => {
   console.error("Failed to load playlists:", err);
});

 // 2) Create each card
  function createPlaylistTile(pl) {
   
   const tile = document.createElement("div");
   tile.className = "playlist-cards";
   tile.innerHTML = `
   <div class = "image-wrapper">
      <img src="${pl.playlist_art}" alt="${pl.playlist_name}">
      <div class ="options gradient-overlay">
         <span class="play">&#9654;</span>
            <div class = "likes">
               <span class="like-icon">&#x2665;</span>
               <span class ="like-count">${pl.likeCount}</span>
            </div>
         <span class = "more">&#x2026;</span>
         <span class = "trash"><i class="fa-solid fa-trash-can"></i></span>
      </div>
   </div>
   <h2>${pl.playlist_name}</h2>
   <p>By ${pl.playlist_creator}</p>
   `;

   // in each card/playlist, toggle like/unlike
   const heart = tile.querySelector(".like-icon");
   const count = tile.querySelector(".like-count");
   heart.addEventListener("click", (e) => {
   e.stopPropagation();
   let n = parseInt(count.textContent, 10);
   if (heart.classList.contains("liked")) {
      heart.classList.remove("liked");
      count.textContent = --n;
   } else {
      heart.classList.add("liked");
      count.textContent = ++n;
   }
   });

   container.appendChild(tile);

   const deletePlaylist = tile.querySelector(".trash");
   // delete playlist
   deletePlaylist.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this item?")) {
         // deletes playlist on screen
         tile.remove();

         // deletes playlist on json file
         const index = playlistsData.findIndex(p => p.playlist_name === pl.playlist_name);
         if (index !== -1) {
            playlistsData.splice(index, 1);  // remove from array
            console.log(`Playlist "${pl.playlist_name}" deleted.`);
         }
         // displays succesfull playlist deletion
         console.log("Playlist Deleted");
      } else {
         // displays cancellation of playlist deletion
         console.log("No Changes Saved");
      }
   })

   // open modal when clicking the more button
   tile.querySelector(".more").addEventListener("click", (e) => {
      openModal(pl);
   });
   tile.querySelector(".image-wrapper").addEventListener("click", (e) => {
      openModal(pl);
   });
}

// 3) Populate and show modal
function openModal(pl) {
   modalArt.src = pl.playlist_art;
   modalArt.style.width = "100%";
   modalArt.style.height = "40vw";
   modalName.textContent = pl.playlist_name;
   modalAuthor.textContent = "By " + pl.playlist_creator;

   modalSongs.innerHTML = "";

   if (shuffleOrder && currentPlaylistName === pl.playlist_name) {
      // Use saved shuffle order: add each saved <li> back to the modal
      shuffleOrder.forEach(li => modalSongs.appendChild(li));
      currentSongs = Array.from(modalSongs.children);
   } else{
      pl.songs.forEach((s) => {
      const li = document.createElement("li");

      // create cover
      const img = document.createElement("img");
      img.src = s.cover_art;
      img.alt = s.title + " cover art";
      img.style.width = "40px"; 
      // optional styling
      img.style.height = "40px";
      img.style.marginRight = "8px";
      img.style.verticalAlign = "middle";

      li.appendChild(img);
      li.append(` ${s.title} — ${s.artist} (${s.duration})`);

      modalSongs.appendChild(li);
   });
   // stores current songs as <li>
   currentSongs = Array.from(modalSongs.children);
   shuffleOrder = null;
   }

   // displays songs in ui
   currentPlaylistName = pl.playlist_name;
   modal.classList.add("show");
}

// shuffle button
   shuffleBtn.addEventListener("click", (e) => {
      let currentIndex = currentSongs.length;
      while (currentIndex !== 0) {
         let random = Math.floor(Math.random() * currentIndex);
         currentIndex--;
         [currentSongs[currentIndex], currentSongs[random]] =
            [currentSongs[random], currentSongs[currentIndex]];
      }

   //update modal
   modalSongs.innerHTML = "";
   currentSongs.forEach(s => modalSongs.appendChild(s));

   // save shuffle order
   shuffleOrder = [...currentSongs];
})

// 4) Close handlers
closeBtn.addEventListener("click", () => {
   modal.classList.remove("show");
});

modal.addEventListener("click", (e) => {
   if (e.target === modal) {
   modal.classList.remove("show");
   }
});

// FEATURED PAGE
function featuredPage(){
  fetch("data/data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network error: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      let previousIndex = sessionStorage.getItem("lastFeaturedIndex");
      previousIndex = previousIndex !== null ? parseInt(previousIndex, 10) : -1;

      let randomIndex;
      do {
      randomIndex = Math.floor(Math.random() * data.playlists.length);
      } while (randomIndex === previousIndex && data.playlists.length > 1);

      sessionStorage.setItem("lastFeaturedIndex", randomIndex);

      const pl = data.playlists[randomIndex];
      const art = document.getElementById("playlist_art");
         art.src = pl.playlist_art;
         art.style.width = "100%";
         art.style.height = "40vw";

      const name = document.getElementById("playlist_name")
         name.textContent = pl.playlist_name;
         name.style.textAlign = "center";

      const songs = document.getElementById("songs");
         songs.style.width = "50vw";
      songs.innerHTML = "";
      pl.songs.forEach((s) => {
        const li = document.createElement("li");

         // create cover
         const img = document.createElement("img");
         img.src = s.cover_art;
         img.alt = s.title + " cover art";
         img.style.width = "10%"; 
         // optional styling
         img.style.height = "100%";
         img.style.marginRight = "8px";
         img.style.verticalAlign = "middle";

         li.appendChild(img);
         li.append(`${s.title} — ${s.artist} (${s.duration})`);
         songs.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Failed to load featured playlist:", err);
    });
}
})
