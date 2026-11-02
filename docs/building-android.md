# Building the Android release (.aab)

This builds a signed Android App Bundle (`.aab`) for upload to the Google Play Console.

## One-time setup

1. **Keystore:** place the upload keystore at `android/app/keystore.jks`.
   It is git-ignored (`*.jks`, and the whole `android/` folder).

2. **Passwords:** add these to `android/gradle.properties` (git-ignored):

   ```
   MYAPP_UPLOAD_STORE_FILE=keystore.jks
   MYAPP_UPLOAD_KEY_ALIAS=your-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
   MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
   ```

3. **Backup:** keep a copy of `keystore.jks` and the passwords somewhere safe, outside this project.
   If you lose the upload key, you cannot update the app on Google Play.

## Build

1. Bump the version in `app.json`: `version` (for example `1.2.1`) and `android.versionCode` (must be higher than the last upload).
2. Regenerate the native folder so `android/` matches `app.json`:

   ```
   bun run build:android
   ```

   Do not use `--clean`. It deletes `android/`, including the keystore and passwords.

3. **Re-apply the release signing change** in `android/app/build.gradle`, because step 2 regenerates that file:
   - add a `release { ... }` block inside `signingConfigs` that reads the four `MYAPP_UPLOAD_...` values;
   - set the `release` build type to `signingConfig signingConfigs.release`.

4. Build the bundle:

   ```
   cd android && ./gradlew bundleRelease
   ```

5. The output is at `android/app/build/outputs/bundle/release/app-release.aab`.
   Upload this file in the Play Console.

## Notes

- Debug builds (`npm run android`) still use `debug.keystore`. Only release builds use the upload key.
- Step 3 is needed after every prebuild. An Expo config plugin would automate it; ask if you want that set up.
