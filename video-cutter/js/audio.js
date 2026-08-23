// Music library helpers: metadata reading + pure array operations for the
// library list. All state mutation happens in app.js; these are small
// testable building blocks.

let nextId = 1;

export function readAudioMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement('audio');
    el.preload = 'metadata';

    el.onloadedmetadata = () => {
      resolve({ url, duration: el.duration });
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('audio-metadata-failed'));
    };
    el.src = url;
  });
}

export function makeMusicId() {
  return `m${nextId++}`;
}

export function moveItem(array, fromIndex, toIndex) {
  const copy = array.slice();
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

/**
 * Sequential assignment of music to clips, honoring the chosen overflow
 * behavior once the library runs out. Mutates clip.musicId in place and
 * returns the same array for convenience.
 */
export function autoAssignMusic(clips, library, overflowBehavior) {
  clips.forEach((clip, i) => {
    if (library.length === 0) {
      clip.musicId = null;
      return;
    }
    if (i < library.length) {
      clip.musicId = library[i].id;
      return;
    }
    if (overflowBehavior === 'repeat') {
      clip.musicId = library[i % library.length].id;
    } else {
      // 'none' and 'manual' both leave the clip unassigned; 'manual' just
      // signals to the UI that the user is expected to pick one by hand.
      clip.musicId = null;
    }
  });
  return clips;
}
