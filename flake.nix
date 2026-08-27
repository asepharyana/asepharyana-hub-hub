{
  description = "Asepharyana Hub — personal portfolio SPA (Next.js)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        hub = pkgs.stdenv.mkDerivation {
          name = "hub-0.1.0";
          src = ./.;

          nativeBuildInputs = with pkgs; [ bun nodejs-slim_22 ];
          buildInputs = with pkgs; [ nodejs openssl stdenv.cc.cc.lib libffi ];

          LIBCLANG_PATH = "${pkgs.libclang.lib}/lib";
          LD_LIBRARY_PATH = "${pkgs.libclang.lib}/lib:${pkgs.stdenv.cc.cc.lib}/lib:${pkgs.libffi}/lib";
          NIX_ENFORCE_PURITY = "0";

          SSL_CERT_FILE = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
          NODE_EXTRA_CA_CERTS = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
          NODE_ENV = "production";

          phases = [ "unpackPhase" "buildPhase" "installPhase" ];
          buildPhase = ''
            export HOME="$TMPDIR"
            echo "=== Installing dependencies ==="
            bun install 2>&1
            echo "=== Building Next.js ==="
            bun run build 2>&1
          '';
          installPhase = ''
            mkdir -p $out/share/hub $out/bin
            cp -r .next $out/share/hub/
            cp -r public $out/share/hub/ 2>/dev/null || true
            cp package.json $out/share/hub/
            cp next.config.{ts,mjs,js} $out/share/hub/ 2>/dev/null || true
            cp -r node_modules $out/share/hub/
            cat > $out/bin/hub << WRAPPER
#!${pkgs.runtimeShell}
exec ${pkgs.bun}/bin/bun run --cwd $out/share/hub start
WRAPPER
            chmod +x $out/bin/hub
          '';
        };
      in
      {
        packages = {
          inherit hub;
          default = hub;
        };

        apps.hub = {
          type = "app";
          program = "${hub}/bin/hub";
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs-slim_22 bun ];
        };
      });
}