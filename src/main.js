	const config = {
		type: Phaser.CANVAS,
		width: 800,
		height: 600,
		background: "#393f86",
		scene: {
			preload:preload,
			create: create,
			update: update
		},
		audio: {
	        disableWebAudio: false
	    }
	};

	//cutscenes

	let cutsceneOne;
	let cutsceneTwo;
	let cutsceneGroup1;
	let cutsceneGroup2;
	let currentCutscenePhase = 0;
	const cutsceneDialog = [
	//cutscene 1 dialog
		"[ Year 2226, The Mothership: Briefing Room]",
		"Chief Astronomer: This star has the Formal Designation: WISE J072003.20-084651.2. Famous for passing through the Oort Cloud more than 70,000 years ago. Commonly called Scholz's Star.",
		"MORROW-8: Does it have our classification?",
		"Chief Astronomer: I am afraid not, Captain. MORROW-8: Why not?",

	//cutscene 2 dialog	
		"Chief Astronomer: It is a new discovery. We only know that it feeds on time... much like a black hole that feeds on everything.",
		"MORROW-8: Shouldn't it be classified as a black hole then?",
		"Astronomer: It doesn't consume like one. Its gravity is comparable to a typical red dwarf.",
		 "Morrow-8: (nods) We should see the footage now, Chief.", 
		"Chief Astronomer: Yes, Captain."
	];



	//overlay variables
	let scanline;
	let station;
	let visor;
	let tvStatic;

	let currentVHS;
	let currentVHSTexture = "secondZero";

	let secondZero;
	let secondOne;

	//cursor control
	let cursors;

	//sensor value
	let oxygenValue = 99;

	//UI
	let oxygenText;
	let controlsText;

	//sound file
	let visorBreath;
	let endStaticSound;

	let gameEnded = false;
	let gameOver = false;

	let endText;

	let currentLoop = 0;

	let finalCutscene;
	let finalCutsceneGroup1;
	let finalCutsceneGroup2;
	let currentFinalCutscenePhase = 0;
	let inFinalCutscene = false;

	let inMainMenu = true;
	let mainMenuGroup;

	const finalCutsceneDialog = [
	//final_cutscene_1_dialog
		"(silence in the room)\n\n",
		"MORROW-8: What happened to him? WHAT HAPPENED TO OUR NAVAL PILOT?!",
		"Chief Astronomer: (calmly) I am just as confused and angry as you are, Captain.",
		"MORROW-8: ...Any new info about this godforsaken star?",
		"Chief Astronomer: More research is underway, Captain.",

	//final_cutscene_2_monolog
		"[Year 2026, xx:9:xx pm]",
		"O Earthlings, your time is over."
	]

	const loopAnims = ["loop 0", "loop 1", "loop 2", "loop 3"];
	let vhsDates = ["secondZero", "secondOne", "secondTwo", "secondThree", "secondFour"];
	let vhsDatesDisplay;

	//-----------------------------

	function preload() {
	// Initializing image and spritesheet rendering
		this.load.image("titleScreen", "assets/images/title.png");
		this.load.image("cutsceneOne", "assets/cutscenes/starting_cutscene_1.png");
		this.load.image("cutsceneTwo", "assets/cutscenes/starting_cutscene_2.png");
		this.load.image("scanline", "assets/images/scanline.png");
		this.load.spritesheet("station", "assets/sprite/station.png", {
			frameWidth: 800,
			frameHeight: 600
		});
		this.load.spritesheet("tv static", "assets/sprite/tv static.png", {
			frameWidth: 800,
			frameHeight: 600
		});
		this.load.image("visor", "assets/images/visor.png");
		this.load.image("secondZero", "assets/vhs overlay/secondZero.png");
		this.load.image("secondOne", "assets/vhs overlay/secondOne.png");
		this.load.image("secondTwo", "assets/vhs overlay/secondTwo.png");
		this.load.image("secondThree", "assets/vhs overlay/secondThree.png");
		this.load.image("secondFour", "assets/vhs overlay/secondFour.png");
		this.load.image("finalCutsceneOne", "assets/cutscenes/final_cutscene_1.png");
		this.load.image("finalCutsceneTwo", "assets/cutscenes/final_cutscene_2.png");

	//Initializing sound file rendering

		this.load.audio("visorBreath", "assets/sound effects/visor breath.mp3");
		this.load.audio("endStaticSound", "assets/sound effects/vhsStatic.mp3");

	//Initializing control rendering

		cursors = this.input.keyboard.createCursorKeys();
	}
	//-----------------------------

	// Initializing sensors

	function setOxygen(value) {
		oxygenValue = Phaser.Math.Clamp(value, 0, 100);
		oxygenText.setText("O2: " + oxygenValue + "%");

		if (oxygenValue <= 20) oxygenText.setColor("#ff3300");
		else if (oxygenValue <= 40) oxygenText.setColor("#ffaa00");
		else oxygenText.setColor("#fff");

		if (oxygenValue <= 0 && !gameOver && !gameEnded) {
			triggerOxygenGameOver();
		}
	}

	function triggerOxygenGameOver() {
	    gameOver = true;
	    
	    // Fade out gameplay elements
	    visor.setAlpha(0);
	    scanline.setAlpha(0);
	    station.setAlpha(0);
	    vhsDatesDisplay.setAlpha(0);
	    intText.setAlpha(0);
	    oxygenText.setAlpha(0);
	    
	    // Show black screen with text
	    wakeUpText.setText("Morrow-6... I must find her...\n\nPress R to wake up");
	    wakeUpText.setAlpha(1);
	    
	    // Lower breathing sound volume
	    visorBreath.setVolume(0.1);
	}

	//-----------------------------

	function create() {
	mainMenuGroup = this.add.container();
	let titleImage = this.add.image(400, 300, "titleScreen"); 
	mainMenuGroup.add(titleImage);

	let playButton = this.add.text(400, 350, "PLAY", {
		font: "monospace",
		fontSize: "48px",
		fill:"#00ff00",
		stroke: "#000000",
		strokeThickness: 4
		}).setOrigin(0.5).setInteractive();

	let quitButton = this.add.text(400, 450, "QUIT", {
		font: "monospace",
		fontSize: "48px",
		fill:"#00ff00",
		stroke: "#000000",
		strokeThickness: 4
		}).setOrigin(0.5).setInteractive();

	mainMenuGroup.add(playButton);
	mainMenuGroup.add(quitButton);
	mainMenuGroup.setDepth(5000);

	playButton.on('pointerover', () => playButton.setFill("#ffffff"));
	playButton.on('pointerout', () => playButton.setFill("#00ff00"));
	playButton.on('pointerdown', () => {
		startGame.call(this);
	});

	quitButton.on('pointerover', () => quitButton.setFill("#ffffff"));
	quitButton.on('pointerout', () => quitButton.setFill("#00ff00"));
	quitButton.on('pointerdown', () => {
		windows.close();
	});

	// Initializing cutscenes
	inCutscene = false;

	cutsceneGroup1 = this.add.container();
	cutsceneGroup1.add(this.add.image(400, 300, "cutsceneOne").setDepth(0));

	let dialogText1 = this.add.text(50, 150, cutsceneDialog.slice(0, 5).join('\n\n'), { 
	    fontFamily: "Monospace",
	    fontSize: "22px",
	    fill: "#00ff00",
	    stroke: "#000000",
	    strokeThickness: 5,
	    wordWrap: { width: 700, useAdvancedWrap: true }
	}).setDepth(10).setAlpha(1);

	cutsceneGroup1.add(dialogText1);
	cutsceneGroup1.setAlpha(0);  // *** HIDE GROUP TILL FADE IN ***

	// Phase 2 group (hidden)
	cutsceneGroup2 = this.add.container();
	cutsceneGroup2.add(this.add.image(400, 300, "cutsceneTwo").setDepth(0));

	let dialogText2 = this.add.text(50, 150, cutsceneDialog.slice(5).join('\n\n'), { 
	    fontFamily: "Monospace",
	    fontSize: "22px",
	    fill: "#00ff00",
	    stroke: "#000000",
	    strokeThickness: 5,    
	    wordWrap: { width: 700, useAdvancedWrap: true }
	}).setDepth(10).setAlpha(1);

	cutsceneGroup2.add(dialogText2);
	cutsceneGroup2.setAlpha(0);	

	finalCutsceneGroup1 = this.add.container();
	finalCutsceneGroup1.add(this.add.image(400, 300, "finalCutsceneOne").setDepth(0));

	let finalDialogText1 = this.add.text(50, 150, finalCutsceneDialog.slice(0, 5).join('\n\n'), {
	    fontFamily: "Monospace",
	    fontSize: "22px",
	    fill: "#00ff00",
	    stroke: "#000000",
	    strokeThickness: 5,    
	    wordWrap: { width: 700, useAdvancedWrap: true }
	}).setDepth(10).setAlpha(1);

	finalCutsceneGroup1.add(finalDialogText1);
	finalCutsceneGroup1.setAlpha(0);

	finalCutsceneGroup2 = this.add.container();
	finalCutsceneGroup2.add(this.add.image(400, 300, "finalCutsceneTwo").setDepth(0));

	let finalDialogText2 = this.add.text(50, 200, finalCutsceneDialog.slice(5).join('\n\n'), {
	    fontFamily: "Monospace",
	    fontSize: "22px",
	    fill: "#00ff00",
	    stroke: "#000000",
	    strokeThickness: 5,    
	    wordWrap: { width: 700, useAdvancedWrap: true }
	}).setDepth(10).setAlpha(1);

	finalCutsceneGroup2.add(finalDialogText2);
	finalCutsceneGroup2.setAlpha(0);

	finalCutsceneGroup1.setDepth(2000);
	finalCutsceneGroup2.setDepth(2000);

	this.input.keyboard.on("keydown-ENTER", () => {
		if (inMainMenu) return;
	    if (inFinalCutscene) {
	        advanceFinalCutscene.call(this);
	    } else {
	        advanceCutscene.call(this);
	    }
	});

	//Initializing sound configuration

		visorBreath = this.sound.add("visorBreath", {
			loop: true,
			volume: 0.2
		});

		endStaticSound = this.sound.add("endStaticSound", {
			loop: true,
			volume: 0.5
		});
		
	// Initializing overlay and images positioning

		scanline = this.add.image(400, 300, "scanline").setDepth(999).setAlpha(0.3);	
		station = this.add.sprite(400, 300, "station").setDepth(997);
		visor = this.add.image(400, 300, "visor").setAlpha(0.5).setDepth(998);
		tvStatic = this.add.sprite(400, 300, "tv static").setDepth(997).setAlpha(0);
		vhsDatesDisplay = this.add.image(400, 300, vhsDates[0]).setDepth(1000).setAlpha(0.3).setScrollFactor(0).setScale(1);

	// Initializing UI texts
		
		oxygenText = this.add.text(130, 60, "", {
			fontFamily:"monospace",
			fontSize: "25px",
			fill: "#ffffff",
		}).setDepth(998);

		endText = this.add.text(400, 250, "END OF TRANSMISSION", {
			fontFamily:"monospace",
			fontSize: "48px",
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 6,
		}).setDepth(1006).setOrigin(0.5).setAlpha(0);

		wakeUpText = this.add.text(400, 300, "", {
	    	fontFamily:"monospace",
	    	fontSize: "32px",
	    	fill: "#ffffff",
	    	stroke: "#000000",
	    	strokeThickness: 4,
	    	align: "center"
		}).setDepth(1006).setOrigin(0.5).setAlpha(0);

		controlsText = this.add.text(400, 300,
			"Use UP ARROW to move forward\n" +
			"Use DOWN ARROW to move backward\n" +
			"Press E to interact",{
			fontFamily:"monospace",
			fontSize: "25px",
			fill: "#ffffff",

			}).setDepth(1006).setOrigin(0.5).setAlpha(0);

	// Interaction using E

		intText = this.add.text(390, 500, "E", {
			fontFamily: "Monospace",
			fontSize: "25px",
			fill: "#fff"
		}).setDepth(999).setAlpha(0);

	    // *** HIDE ALL GAMEPLAY OVERLAYS DURING CUTSCENES***
	    scanline.setAlpha(0);
	    station.setAlpha(0);
	    visor.setAlpha(0);
	    tvStatic.setAlpha(0);
	    oxygenText.setAlpha(0);
	    intText.setAlpha(0);
	    vhsDatesDisplay.setAlpha(0);
	    endText.setAlpha(0);
	    cutsceneGroup1.setAlpha(0);
	    cutsceneGroup2.setAlpha(0);


	//Oxygen depletion
		this.time.addEvent({
			delay: 5000,
			callback: () => {
				setOxygen(oxygenValue - 1);
			},
			loop: true
		});

	//Initializing animations

		this.anims.create({
			key: "loop 0",
			frames: this.anims.generateFrameNumbers("station", { start: 0, end: 3 }),
			frameRate: 0.5,
			repeat: -1,
		}); //loop 0 animation

		this.anims.create({
			key: "loop 1",
			frames: this.anims.generateFrameNumbers("station", { start: 4, end: 5 }),
			frameRate: 0.5,
			repeat: -1,
		}); //loop 1 animation


		this.anims.create({
			key: "loop 2",
			frames: this.anims.generateFrameNumbers("station", { start: 6, end: 7 }),
			frameRate: 0.5,
			repeat: -1,
		}); //loop 2 animation

		this.anims.create ({
			key: "loop 3",
			frames: this.anims.generateFrameNumbers("station", { start:8, end: 9 }),
			frameRate: 0.5,
			repeat: 0, 
		}); //loop 3 animation

		this.anims.create ({
			key: "WISE",
			frames: this.anims.generateFrameNumbers("station", { start:10, end: 12 }),
			frameRate: 2,
			repeat: 0,
		}); //WISE encounter


		this.anims.create ({
			key: "tvStaticAnim",
			frames: this.anims.generateFrameNumbers("tv static", { start: 0, end: 16 }),
			frameRate: 14,
			repeat: 0,	
		});

		this.anims.create ({
			key: "collapse",
			frames: this.anims.generateFrameNumbers("station", { start:13, end: 15 }),
			frameRate: 1,
			repeat: 0,
		}); //temporal collapse

		this.anims.create({
			key: "tvStaticLoop",
			frames: this.anims.generateFrameNumbers("tv static", { start: 0, end: 16 }),
			frameRate: 8,
			repeat: -1,	
		}); //end transmission screen

	// Calling all functions
		
		station.play(loopAnims[currentLoop]);	

		station.on("animationupdate", (anim, frame) => {
			let f = frame.index;
			if (f === 0 || f === 3) 
				playStatic();
		});	
		
		enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		let rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);  // ← Add this

		this.input.keyboard.on("keydown-R", () => {
	    	if (gameOver) {
	        wakeUpText.setAlpha(0);
	        gameOver = false;
	        
	        setOxygen(99);
	        
	        // Restore gameplay elements
	        visor.setAlpha(0.5);
	        scanline.setAlpha(0.3);
	        station.setAlpha(0.7);
	        vhsDatesDisplay.setAlpha(0.3);
	        oxygenText.setAlpha(1);
	        
	        // Reset breathing volume
	        visorBreath.setVolume(0.2);
	        
	        // Reset station state
	        station.setScale(1.05);
	        currentLoop = 0;
	        station.play(loopAnims[currentLoop]);
	        vhsDatesDisplay.setTexture(vhsDates[currentLoop]);
	    }
	});

		setOxygen(oxygenValue);
	}

	//-----------------------------

	// *** ADVANCE DIALOG ***
	function advanceCutscene() {
	    if (currentCutscenePhase === 0) {
	        // *** PHASE 1 OUT → PHASE 2 IN ***
	        this.tweens.add({
	            targets: cutsceneGroup1,
	            alpha: 0,
	            duration: 1000,
	            onComplete: () => {
	                this.tweens.add({
	                    targets: cutsceneGroup2,
	                    alpha: 1,
	                    duration: 2000
	                });
	                currentCutscenePhase = 1;
	            }
	        });
	    } else if (currentCutscenePhase === 1) {
	        // *** PHASE 2 OUT → GAMEPLAY DROP ***
	        this.tweens.add({
	            targets: cutsceneGroup2,
	            alpha: 0,
	            duration: 1000,
	            onComplete: () => {
	                // *** GLITCH BURST TO HORROR ***
	                playStatic();
	                inCutscene = false;
	                cutsceneGroup1.destroy();
	                cutsceneGroup2.destroy();

	                // *** REVEAL VHS HELL ***
	                scanline.setAlpha(0.3);
	                station.setAlpha(0.7);
	                visor.setAlpha(0.5);
	                oxygenText.setAlpha(1);
	                vhsDatesDisplay.setAlpha(0.3);
	                station.play("loop 0");
	                
	                // Start breathing sound when gameplay begins
	                visorBreath.play();

	                this.tweens.add({
	    			targets: controlsText,
	   				alpha: 1,
	    			duration: 500,
	    			ease: 'Power2',
	    			onComplete: () => {
	        			this.time.delayedCall(2500, () => {
	            			this.tweens.add({  
	                			targets: controlsText,
	                			alpha: 0,
	                			duration: 1000,
	                			ease: 'Power2'
	            			}); 
	        			});
	    			}
				});
	            }
	        });
	    }
	}

	function startGame() {
		inMainMenu = false;
		inCutscene = true;

		mainMenuGroup.setAlpha(0);

		this.tweens.add({
			targets: cutsceneGroup1,
			alpha: 1,
			duration: 2000,
			ease: 'Power2'
			});
	}

	function startFinalCutscenes() {
		inFinalCutscene = true;

		endStaticSound.stop();
		tvStatic.setAlpha(0);
		endText.setAlpha(0);

		this.tweens.add({
			targets: finalCutsceneGroup1,	
			alpha: 1,
			duration: 2000,
			ease: 'Power2'
		});
	}

	function advanceFinalCutscene() {
	    if (currentFinalCutscenePhase === -1) {
	    	startFinalCutscenes.call(this);
	    	currentFinalCutscenePhase = 0;
	    } else if (currentFinalCutscenePhase === 0) {
	        this.tweens.add({
	            targets: finalCutsceneGroup1,
	            alpha: 0,
	            duration: 1000,
	            onComplete: () => {
	                this.tweens.add({
	                    targets: finalCutsceneGroup2,
	                    alpha: 1,
	                    duration: 2000,
	                    ease: 'Power2'
	                });
	                currentFinalCutscenePhase = 1;
	            }
	        });
	    } else if (currentFinalCutscenePhase === 1) {
	        // Fade out and truly end
	        this.tweens.add({
	            targets: finalCutsceneGroup2,
	            alpha: 0,
	            duration: 2000,
	            onComplete: () => {
	                // Show final "END OF TRANSMISSION"
	                tvStatic.setAlpha(1);
	                tvStatic.setDepth(3000);
	                endText.setAlpha(1);
	                endText.setDepth(3001);
	                endStaticSound.play();
	                
	                finalCutsceneGroup1.destroy();
	                finalCutsceneGroup2.destroy();
	                inFinalCutscene = false;

	            }
	        });
	    }
	}

	function playStatic() {
		tvStatic.setAlpha(1);
		tvStatic.play("tvStaticAnim");

		tvStatic.once("animationcomplete", () => {
			tvStatic.setAlpha(0);
		});
	}
	//-----------------------------

	function doVHSTransition() {
		tvStatic.setAlpha(1);
		tvStatic.play("tvStaticAnim");
		tvStatic.once("animationcomplete", () => {
			tvStatic.setAlpha(0);
		
			currentLoop++;
			if (currentLoop >= loopAnims.length) {
				station.setScale(1.05);
				station.play("WISE");

				station.once("animationcomplete", () => {
					tvStatic.setAlpha(1);
					tvStatic.play("tvStaticAnim");

					tvStatic.once("animationcomplete", () => {
						tvStatic.setAlpha(0);
						station.play("collapse");

						station.once("animationcomplete", () => {
							tvStatic.setAlpha(1);
							tvStatic.setDepth(1010);
							tvStatic.play("tvStaticLoop");

							endText.setAlpha(1);
							endText.setDepth(1011);   
	 						
							visorBreath.stop();
	 						endStaticSound.play();

	    					oxygenText.setAlpha(0);
			    			intText.setAlpha(0);
	    					visor.setAlpha(0);
	    					scanline.setAlpha(0);
	    					vhsDatesDisplay.setAlpha(0);
	    					station.setAlpha(0);

							gameEnded = true;
							inFinalCutscene = true;
							currentFinalCutscenePhase = -1;
						});
					});
				});
				return;
			}

			station.play(loopAnims[currentLoop]);
			station.setScale(1.05);	
			vhsDatesDisplay.setTexture(vhsDates[currentLoop]);
		});
	}

	function update() {
		if (gameEnded || gameOver) {
			return;
		}

		if (station.scaleX >= 2) {
			intText.setAlpha(1);
		} else {
			intText.setAlpha(0);
		}

		if (station.scaleX >= 2 && Phaser.Input.Keyboard.JustDown(enterKey)) {
			doVHSTransition();
		};
	// Initiating movements

		const zSpeed = 0.011;
		const minZoom = 1.05;
		const maxZoom = 2.05;

		if (cursors.up.isDown && station.scaleX < maxZoom) {	
			station.scaleX += zSpeed;
			station.scaleY += zSpeed;

		} else if (cursors.down.isDown && station.scaleX > minZoom) {
			station.scaleX -= zSpeed;
			station.scaleY -= zSpeed;
		}

	}

	new Phaser.Game(config);