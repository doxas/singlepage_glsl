/**
 * single page glsl
 */
(() => {
    // ページのロードが完了したら実行する
    window.addEventListener('load', () => {
        // 各種変数の宣言
        let canvas          = null; // canvas エレメント
        let gl              = null; // WebGL コンテキスト
        let program         = null; // プログラムオブジェクト
        let run             = true; // 実行管理フラグ（false でアニメーション停止）
        let time            = 0;    // 実行後経過時間
        let startTime       = 0;    // 実行開始時間
        let vertex          = null; // 頂点シェーダ
        let vertexSource    = '';   // 頂点シェーダのソースコード
        let fragment        = null; // フラグメントシェーダ
        let fragmentSource  = '';   // フラグメントシェーダのソースコード
        let attribLocation  = null; // 頂点シェーダの attribute location
        let uniformLocation = null; // シェーダの uniform location
        let width           = 0;    // レンダリング領域の幅
        let height          = 0;    // レンダリング領域の高さ

        // アニメーションを止められるようにキーダウンイベントを仕込む
        window.addEventListener('keydown', (eve) => {
            // 実行フラグに Esc キーかどうかの比較結果を入れる
            run = (eve.keyCode !== 27);
        }, true);

        // canvas を取得して WebGL コンテキストを取得する
        canvas = document.getElementById('webglcanvas');
        gl = canvas.getContext('webgl');

        // シェーダファイルを XMLHttpRequest を使って取得する（まず頂点シェーダから）
        loadSourceFromFile('./vertex.vert', (err, source) => {
            if(err){
                // うまく読み込めなかったらアラート出して return
                alert('vertex shader load failed');
                return;
            }
            // 頂点シェーダのソース
            vertexSource = source;
            // 正しく頂点シェーダが読み込めたので次にフラグメントシェーダ
            loadSourceFromFile('./fragment.frag', (err, source) => {
                if(err){
                    // うまく読み込めなかったらアラート出して return
                    alert('fragment shader load failed');
                    return;
                }
                // フラグメントシェーダのソース
                fragmentSource = source;

                // シェーダが両方共読み込めたので初期化処理を呼ぶ
                init();
            });
        });

        // 初期化処理
        function init(){
            // 頂点シェーダをコンパイルする
            vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
            // フラグメントシェーダをコンパイルする
            fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
            // うまくコンパイルできなかった場合 return
            if(vertex === null || fragment === null){return;}

            // プログラムオブジェクトを生成する
            program = gl.createProgram();
            // 頂点シェーダとフラグメントシェーダをプログラムオブジェクトにアタッチ
            gl.attachShader(program, vertex);
            gl.attachShader(program, fragment);
            // シェーダをアタッチ完了したらリンクする
            gl.linkProgram(program);
            // リンクに失敗していたら return
            if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
                alert(gl.getProgramInfoLog(program));
                return;
            }
            // リンクが完了したらこのプログラムオブジェクトを使うことを宣言
            gl.useProgram(program);

            // uniform Location を取得する
            uniformLocation = {};
            uniformLocation.time = gl.getUniformLocation(program, 'time');
            uniformLocation.reso = gl.getUniformLocation(program, 'resolution');

            // 板ポリの頂点データを定義して VBO を生成する
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0,-1,-1,0,1,1,0,1,-1,0]), gl.STATIC_DRAW);
            // attribute Location を取得する
            attribLocation = gl.getAttribLocation(program, 'position');
            // attribute Location を有効化
            gl.enableVertexAttribArray(attribLocation);
            // attribute Location の紐付け
            gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0);

            // 背景を初期化する色（RGBA を 0.0 から 1.0 の範囲で指定）
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // 実行開始時間を取得
            startTime = Date.now();

            // すべての準備が整ったのでレンダリング関数を呼ぶ
            render();
        }

        // レンダリング関数
        function render(){
            // フラグをチェックして false なら return
            if(!run){return;}
            // 次のフレームを呼び出しておく
            requestAnimationFrame(render);
            // canvas の大きさをウィンドウサイズに合わせる
            canvas.width = width = window.innerWidth;
            canvas.height = height = window.innerHeight;
            // 現在までの経過時間を取得
            time = (Date.now() - startTime) * 0.001;
            // ビューポートを設定
            gl.viewport(0, 0, width, height);
            // 色をクリアしてリセット
            gl.clear(gl.COLOR_BUFFER_BIT);
            // uniform 変数をシェーダへプッシュする
            gl.uniform1f(uniformLocation.time, time);
            gl.uniform2fv(uniformLocation.reso, [width, height]);
            // 板ポリゴンを描画する
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            // 描画完了を通知
            gl.flush();
        };

        /** XMLHttpRequest を利用してシェーダのファイルを取得する
         * @param {string} path - 読み込むファイルのパス
         * @param {function} callback - コールバック関数
         *
         * もしコールバック関数の第一引数に null 以外のものが入っていたら
         * 読み込み時に失敗しているってこと（ステータスコードを返す）
         */
        function loadSourceFromFile(path, callback){
            let xhr = new XMLHttpRequest();
            xhr.open('GET', path);
            xhr.onload = () => {
                if(xhr.status === 200){
                    callback(null, xhr.response);
                }else{
                    callback(xhr.status);
                }
            };
            xhr.send();
        }

        /** シェーダをコンパイルする
         * @param {number} target - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
         * @param {string} source - シェーダのソースコード
         * @return {any} shader object or null
         *
         * シェーダのコンパイルが正しく終了した場合にはシェーダオブジェクトを返す
         * 失敗していた場合は null が返る
         */
        function compileShader(target, source){
            let shader = gl.createShader(target);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                alert(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
    }, false);
})();

