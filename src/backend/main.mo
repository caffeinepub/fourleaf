import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  module Song {
    public type Update = {
      title : Text;
      artist : Text;
      album : Text;
      duration : Nat;
      coverImage : ?Storage.ExternalBlob;
      audioFile : Storage.ExternalBlob;
    };

    public func compareByDuration(song1 : Song, song2 : Song) : Order.Order {
      switch (Nat.compare(song1.duration, song2.duration)) {
        case (#equal) { Text.compare(song1.title, song2.title) };
        case (order) { order };
      };
    };
  };

  type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    album : Text;
    duration : Nat;
    coverImage : ?Storage.ExternalBlob;
    audioFile : Storage.ExternalBlob;
  };

  var nextSongId = 0;

  type PersonalSong = {
    id : Nat;
    title : Text;
    artist : Text;
    album : Text;
    duration : Nat;
    coverImage : ?Storage.ExternalBlob;
    audioFile : Storage.ExternalBlob;
    owner : Principal;
  };

  var nextPersonalSongId = 0;

  public type UserProfile = {
    name : Text;
    hasActiveSubscription : Bool;
  };

  public type SongMetadata = {
    id : Nat;
    title : Text;
    artist : Text;
    album : Text;
    duration : Nat;
    coverImage : ?Storage.ExternalBlob;
    audioFile : Storage.ExternalBlob;
  };

  let songs = Map.empty<Nat, Song>();
  let personalSongs = Map.empty<Nat, PersonalSong>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func uploadPersonalSong(songUpdate : Song.Update) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload personal songs");
    };

    let personalSong : PersonalSong = {
      id = nextPersonalSongId;
      title = songUpdate.title;
      artist = songUpdate.artist;
      album = songUpdate.album;
      duration = songUpdate.duration;
      coverImage = songUpdate.coverImage;
      audioFile = songUpdate.audioFile;
      owner = caller;
    };

    personalSongs.add(nextPersonalSongId, personalSong);
    nextPersonalSongId += 1;
  };

  public shared ({ caller }) func uploadPublicSong(songUpdate : Song.Update) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload songs");
    };

    let song : Song = {
      id = nextSongId;
      title = songUpdate.title;
      artist = songUpdate.artist;
      album = songUpdate.album;
      duration = songUpdate.duration;
      coverImage = songUpdate.coverImage;
      audioFile = songUpdate.audioFile;
    };

    songs.add(nextSongId, song);
    nextSongId += 1;
  };

  public query ({ caller }) func getPersonalSongs() : async [PersonalSong] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can access personal songs"
      );
    };

    let ownedSongs = personalSongs.values().toArray().filter(
      func(song) { song.owner == caller }
    );
    ownedSongs;
  };

  public query ({ caller }) func isPersonalSongOwner(songId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can check song ownership"
      );
    };

    switch (personalSongs.get(songId)) {
      case null { false };
      case (?song) { song.owner == caller };
    };
  };

  // Public streaming - no authentication required for public catalog songs
  public query ({ caller }) func streamSongAudio(songId : Nat) : async ?Storage.ExternalBlob {
    songs.get(songId).map(func(song) { song.audioFile });
  };

  public query ({ caller }) func streamPersonalSongAudio(songId : Nat) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can stream personal songs"
      );
    };

    switch (personalSongs.get(songId)) {
      case null {
        Runtime.trap("Personal song not found");
      };
      case (?song) {
        if (song.owner != caller) {
          Runtime.trap("Unauthorized: You can only stream your own songs");
        };
        song.audioFile;
      };
    };
  };

  public shared ({ caller }) func downloadSongAudio(songId : Nat) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be logged in to download songs");
    };

    switch (userProfiles.get(caller)) {
      case null {
        Runtime.trap(
          "Subscription required: Please create a profile and subscribe to download songs"
        );
      };
      case (?profile) {
        if (not profile.hasActiveSubscription) {
          Runtime.trap(
            "Subscription required: You need an active subscription to download songs"
          );
        };
      };
    };

    switch (songs.get(songId)) {
      case null {
        Runtime.trap("Song not found");
      };
      case (?song) {
        song.audioFile;
      };
    };
  };

  public query ({ caller }) func downloadPersonalSongAudio(songId : Nat) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can download personal songs"
      );
    };

    switch (personalSongs.get(songId)) {
      case null {
        Runtime.trap("Personal song not found");
      };
      case (?song) {
        if (song.owner != caller) {
          Runtime.trap("Unauthorized: You can only download your own songs");
        };
        song.audioFile;
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Explicit query for the caller's profile - NO AUTHORIZATION CHECK NEEDED
  // This is the key function for the implementation plan: it allows ANY caller
  // (including guests/anonymous) to check if they have a profile, so the frontend
  // can decide whether to show the "Welcome to Fourleaf!" profile setup dialog.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  // Query to get another user's profile - admin only
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getPersonalSongMetadata() : async [SongMetadata] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(
        "Unauthorized: Only authenticated users can access personal song metadata"
      );
    };

    personalSongs.values().toArray().filter(
      func(song) { song.owner == caller }
    ).map(
      func(song) {
        {
          id = song.id;
          title = song.title;
          artist = song.artist;
          album = song.album;
          duration = song.duration;
          coverImage = song.coverImage;
          audioFile = song.audioFile;
        };
      }
    );
  };

  // For developer troubleshooting
  public query ({ caller }) func getUploadPermissionsDebug() : async {
    principal : Principal;
    role : AccessControl.UserRole;
    canUploadToPublicCatalog : Bool;
  } {
    {
      principal = caller;
      role = AccessControl.getUserRole(accessControlState, caller);
      canUploadToPublicCatalog = AccessControl.hasPermission(
        accessControlState,
        caller,
        #user,
      );
    };
  };

  //  Listing and metadata queries   //

  public query func getSongsByDuration() : async [Song] {
    songs.values().toArray().sort(Song.compareByDuration);
  };

  // Public query - no authentication required
  public query func getSong(id : Nat) : async ?Song {
    songs.get(id);
  };

  // Public query - no authentication required
  public query func getAllSongs() : async [Song] {
    songs.values().toArray();
  };

  // Public query - no authentication required
  public query func getTotalSongs() : async Nat {
    songs.size();
  };
};
