const mainScript = () => {

    barba.use(barbaPrefetch);
    //Lenis scroll
    let lenis = new Lenis({
        lerp: false,
        duration: 1.8
    });

    let setLength, aSet, lenisNav, lenisNavWrap;
    if ($(window).width() > 991) {
        $('.nav-main-list').css('overflow-y', 'auto');
        // nav inner infinite scroll init
        setLength = $('.nav-links-inner-wrap').height();
        $('.nav-main-list').css('height',`${setLength}px`)
        aSet = $('.nav-links-inner-wrap').clone();
        $('.nav-inner').append(aSet.clone())
        lenisNav = new Lenis({
            lerp: false,
            wrapper: document.querySelector('.nav-main-list'),
            content: document.querySelector('.nav-inner'),
            duration: 1.4,
            infinite: true
        })
        lenisNavWrap = new Lenis({
            lerp: false,
            wrapper: document.querySelector('.nav'),
            content: document.querySelector('.nav-main'),
            duration: 1.4,
            infinite: true
        })
    }
    
    let navVelo, navDirect;

    function raf(time) {
        lenis.raf(time)
        if ($(window).width() > 991) {
            lenisNav.raf(time)
            lenisNavWrap.raf(time)
        }
        requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    //Utils
    const pi = Math.PI;
    let viewport = {
        width: $(window).width(),
        height: $(window).height(),
        pixelRatio: window.devicePixelRatio,
    }
    const lerp = (a,b,t = 0.08) => {
        return a + (b - a) * t;
    }
    function clamp(number, min, max) {
        return Math.max(min, Math.min(number, max));
    }
    function debounce(func, delay = 100){
        let timer;
        return function(event) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(func, delay, event);
        };
    }
    const useRem = (vw, maxWidth) => {
		vw = viewport.width < maxWidth ? (vw * viewport.width) / 1000 : vw / 10;

		return (value) => Number((value * vw).toFixed(2));
    };

    let rem;
	const responsiveRem = () => {
		rem = useRem(0.5208333333, 2304);
		switch (true) {
			case viewport.width <= 991:
				rem = useRem(1.1990407674, 991);
				break;
			case viewport.width <= 767:
				rem = useRem(1.9556714472, 767);
				break;
			case viewport.width <= 497:
				rem = useRem(2.5445292621, 497);
				break;
		}
	};
    responsiveRem();

    const soundControl = {
        play: function (audio) {
            audio.play();
        },
        stop: function (audio) {
            audio.pause();
        },
        toggle: function (audio) {
            audio.paused ? audio.play() : audio.pause();
        },
        reset: function (audio) {
            audio.currentTime = 0;
        }
    }

    function counter(options) {
        const counterUp = window.counterUp.default;

        const callback = entries => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    counterUp(el, options)
                }
            })
        }
        const observer = new IntersectionObserver(callback);

        document.querySelectorAll('[data-counter]').forEach((item) => {
            observer.observe(item);
        });
    }

    const socialShare = (btnList) => {
        let slug = window.location.pathname.split("/").slice(1);
        if (slug.length > 1) {
            const url = window.location.href;

            for (let i = 0; i < $(btnList).length; i++) {
                let href, options;

                const typeBtn = $(btnList).eq(i).attr("data-social");

                switch (typeBtn) {
                    case 'fb':
                        href = "https://www.facebook.com/sharer/sharer.php?u=";
                        options = "%3F";
                        break;
                    case 'tw':
                        href = "https://twitter.com/share?url=";
                        options = "&summary=";
                        break;
                    case "link":
                        href = "https://www.linkedin.com/shareArticle?mini=true&url=";
                        options = "&summary=";
                        break;
					default: break;
                }
				$(btnList).eq(i).attr("href", `${href}${url}%2F${options}`);
            }
        }
    }

    // Threejs global object
    const gltfLoader = new THREE.GLTFLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader()

    const enviromentMapLoad = cubeTextureLoader.load ([
        'https://uploads-ssl.webflow.com/641aa4b31b9332501957784b/6434ea0b5afac2025c121f7d_px.jpg',
        'https://uploads-ssl.webflow.com/641aa4b31b9332501957784b/6434ea0b5afac25a75121f7f_nx.jpg',
        'https://uploads-ssl.webflow.com/641aa4b31b9332501957784b/6434ea0b66bed8d54bbe0d06_py.jpg',
        'https://uploads-ssl.webflow.com/641aa4b31b9332501957784b/6434ea0c98dcca15ad207b3b_ny.jpg',
        'https://uploads-ssl.webflow.com/641aa4b31b9332501957784b/6434ea0bd29de454b228510d_pz.jpg',
        'https://uploads-ssl.webflow.com/641aa4b31b9332501957784b/6434ea0c39b63b5f4e7fa7a9_nz.jpg',
    ])
    enviromentMapLoad.encoding = THREE.sRGBEncoding;

    let modelUrl = 'https://s3.ap-southeast-1.amazonaws.com/assets.bearplus.io/videos/models/wine_barrel_01_4k.gltf'
    let barrelHomeHero = gltfLoader.loadAsync(modelUrl)
    let barrelHomeDiscor = gltfLoader.loadAsync(modelUrl);
    let barrelGlobalNav = gltfLoader.loadAsync(modelUrl);
    let barrelNav;

    const cameraHomeHero = new THREE.PerspectiveCamera(40, viewport.width / viewport.height , 0.1, 1000);
    const cameraHomeDiscor = new THREE.PerspectiveCamera(15, viewport.width / viewport.height , 0.1, 1000);
    let cameraGlobalNav;
    if ($(window).width() > 991) {
        cameraGlobalNav = new THREE.PerspectiveCamera(15, $('.nav-3d-inner').width() / $('.nav-3d-inner').height() , 0.1, 1000);
    }
    
    let rendererHomeHero = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    rendererHomeHero.setSize(viewport.width , viewport.height);
    if ($(window).width() > 991) {
        rendererHomeHero.setPixelRatio(1)
    } else {
        rendererHomeHero.setPixelRatio(2)
    }
    rendererHomeHero.physicallyCorrectLights = true;
    rendererHomeHero.outputEncoding = THREE.sRGBEncoding;
    rendererHomeHero.toneMapping = THREE.ACESFilmicToneMapping;
    rendererHomeHero.toneMappingExposure = 1.2;
    let rendererHomeDiscor = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    rendererHomeDiscor.setSize(viewport.width , viewport.height);
    rendererHomeDiscor.setPixelRatio(1)
    rendererHomeDiscor.physicallyCorrectLights = true;
    rendererHomeDiscor.outputEncoding = THREE.sRGBEncoding;
    rendererHomeDiscor.toneMapping = THREE.ACESFilmicToneMapping;
    rendererHomeDiscor.toneMappingExposure = 1.2;

    let rendererGlobalNav;
    if ($(window).width() > 991) {
        rendererGlobalNav = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });
        rendererGlobalNav.setSize($('.nav-3d-inner').width() , $('.nav-3d-inner').height());
        rendererGlobalNav.setPixelRatio(1)
        rendererGlobalNav.physicallyCorrectLights = true;
        rendererGlobalNav.outputEncoding = THREE.sRGBEncoding;
        rendererGlobalNav.toneMapping = THREE.ACESFilmicToneMapping;
        rendererGlobalNav.toneMappingExposure = 1.2;
    }

    function onWindowResize() {
        cameraHomeHero.aspect = $(window).width() / $(window).height();
        cameraHomeHero.updateProjectionMatrix();
        cameraHomeDiscor.aspect = $(window).width() / $(window).height();
        cameraHomeDiscor.updateProjectionMatrix();
        if ($(window).width() > 991) {
            cameraGlobalNav.aspect = $('.nav-3d-inner').width() / $('.nav-3d-inner').height();
            cameraGlobalNav.updateProjectionMatrix();
        }

        rendererHomeHero.setSize( $(window).width(), $(window).height());
        rendererHomeDiscor.setSize( $(window).width(), $(window).height());
        if ($(window).width() > 991) {
            rendererGlobalNav.setSize( $('.nav-3d-inner').width(), $('.nav-3d-inner').height());
        }
    }
    $(window).on('resize', debounce(onWindowResize))

    const updateAllMaterial = (scene, environmentMap, hasShadow) => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = environmentMap;
                child.material.needsUpdate = true;
                if (hasShadow) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            }
        })
    }
    const updateLight = (scene, environmentMapIntensity) => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = environmentMapIntensity;
            }
        })
    }
    // End Threejs global object

    // Header
    lenis.on('scroll', function(inst) {
        // Header
        if (inst.scroll > $(window).height() / 4) {
            $('.header-wrap').addClass('scrolled')
        } else {
            $('.header-wrap').removeClass('scrolled')
        }

        // Header on footer

        if (inst.scroll > ($('.main').height() - $(window).height() * 1.5)) {
            if ($('.header-bg').length) {
                $('.header-bg').addClass('hide-on-footer')
            }
            $('.header-wrap').addClass('hide-on-footer')
        } else {
            $('.header-bg').removeClass('hide-on-footer')
            $('.header-wrap').removeClass('hide-on-footer')
        }

    })
    // Toggle progress bar
    setInterval(() => {
        if (lenis.isScrolling) {
            if ($('[data-barba-namespace="contactUs"]').length) {
                return
            }
            $('.header-prog-wrap').removeClass('hidden')
        } else {
            $('.header-prog-wrap').addClass('hidden')
        }
    }, 300)

    // Nav
    $('[data-nav]').on('click', function(e) {
        e.preventDefault();
        let currentAction = $(this).attr('data-nav');
        if (currentAction == 'open') {
            // Open nav
            openNav($(this))

        } else if (currentAction == 'close') {
            // Close nav
            closeNav($(this))
        }
    })
    function openNav(triggerEl) {
        if ($(window).width() > 991) {
            const posCenter = (setLength - $('.nav-link').height()) / 2;
            const activeOffsetTop = $('.nav-link.active').get(0).offsetTop;
            lenisNav.scrollTo(activeOffsetTop - posCenter, { duration: 0 });
        }

        $('.nav').addClass('active')
        triggerEl.attr('data-nav', 'close')
        triggerEl.find('.txt-14').text('Close')
        $('.nav').find('.nav-monogram').addClass('active')
        lenis.stop()
        $('.header-wrap').addClass('on-nav-open')

        gsap.set('.nav-bg-wrap', { yPercent: -100 });
        gsap.set('.nav-3d-inner', { autoAlpha: 0 });
        gsap.set('.nav-3d-grad', { autoAlpha: 0 });
        gsap.set('.nav-link', { autoAlpha: 0, x: rem(-80) });
        gsap.set('.nav-contact-item-wrap', { autoAlpha: 0, x: rem(-40) });
        if ($(window).width() > 991) {
            gsap.set(barrelNav.position, { z: 1 });
        }
        gsap.set('.nav-img-wrap', {clipPath: 'inset(20%)'});
        gsap.set('.nav-img-inner-wrap', {scale: 1.4, autoAlpha: 0});
        gsap.set('.nav-line-inner', { scaleX: 0, autoAlpha: 0 });

        const openNavtl = gsap.timeline({
            onStart() {
                $('[data-nav]').addClass('force-none');
            },
            onComplete() {
                $('[data-nav]').removeClass('force-none');
            }
        })
        openNavtl
        .to('.nav-bg-wrap', { yPercent: 0, duration: 1, ease: 'power2.out' })
        .to('.nav-3d-inner', { autoAlpha: 1, duration: 1, ease: 'power2.out' }, .15)
        .to('.nav-3d-grad', { autoAlpha: 1, duration: 1, ease: 'power2.out' }, .15)
        if ($(window).width() > 991) {
            openNavtl
            .to(barrelNav.position, {z: 0, duration: 1, ease: 'power1.inOut'}, '<=0')
        }
        openNavtl
        .to('.nav-link', {x: 0, autoAlpha: 1, duration: .6, stagger: 0.04, ease: 'power1.out' }, '>-1.2')
        .to('.nav-contact-item-wrap', { x: 0, duration: .8, autoAlpha: 1, stagger: 0.04, ease: 'power1.out' }, '<= .2')
        .to('.nav-line-inner', { scaleX: 1, duration: .6, autoAlpha: 1, ease: 'power1.out' }, '<= 0')
        .to('.nav-img-wrap', {clipPath: 'inset(0%)', duration: 2.5, ease: 'expo.out' }, '>-.8')
        .to('.nav-img-inner-wrap', { scale: 1, duration: 2.5, autoAlpha: .8, ease: 'expo.out' }, '<=0')

    }
    function closeNav(triggerEl) {
        const closeNavtl = gsap.timeline({
            onStart() {
                $('[data-nav]').addClass('force-none');
                triggerEl.attr('data-nav', 'open')
                triggerEl.find('.txt-14').text('Menu');
            },
            onComplete() {
                $('[data-nav]').removeClass('force-none');
                $('.nav').removeClass('active')
                $('.nav').find('.nav-monogram').removeClass('active')
                lenis.start();
                $('.header-wrap').removeClass('on-nav-open')
            }
        });
        closeNavtl
        .to($('.nav-contact-item-wrap').get().reverse(), { x: rem(40), duration: .8, autoAlpha: 0, stagger: 0.04, ease: 'power1.out' }, 0)
        .to('.nav-line-inner', { scaleX: 0, duration: .6, autoAlpha: 1, ease: 'power1.out' }, '<= 0.1')
        .to('.nav-img-wrap', {clipPath: 'inset(20%)', duration: 2, ease: 'expo.out' }, '<=0')
        .to('.nav-img-inner-wrap', { scale: 1.4, duration: 2, autoAlpha: 0, ease: 'expo.out' }, '<=0')
        .to($('.nav-link').get().reverse(), { x: rem(80), autoAlpha: 0, duration: .6, stagger: 0.04, ease: 'power1.out' }, '<= 0.2')
        if ($(window).width() > 991) {
            openNavtl
            .to(barrelNav.position, {z: -1, duration: .8, ease: 'power1.inOut'}, '0')
        }
        openNavtl
        .to('.nav-3d-inner', { autoAlpha: 0, duration: .6, ease: 'power1.out' }, '<=.55')
        .to('.nav-3d-grad', { autoAlpha: 0, duration: .6, ease: 'power1.out' }, '<=0')
        .to('.nav-bg-wrap', { yPercent: 100, duration: 1, ease: 'power1.out' }, '<=.55')
    }
    function resetNav() {
        $('.nav').removeClass('active')
        $('[data-nav]').attr('data-nav', 'open')
        $('[data-nav]').find('.txt-14').text('Menu')
        $('.header-wrap').removeClass('on-nav-open')
        lenis.start()
    }
    function addNavActiveLink(nextPage) {
        $('.nav-link').removeClass('active')
        $(`.nav-link[data-nav-link="${nextPage}"]`).addClass('active')
    }

    //TOC
    function createToc(richtextEl) {
        let headings = $(richtextEl).find('h2');
        let tocWrap = $('.toc-inner');

        if (headings.length <= 1) {
            tocWrap.parent().remove();
        }

        tocWrap.html('');
        for (let i = 0; i < headings.length; i++) {
            headings.eq(i).attr('id', `toc-${i}`);
            let tocItem = $('<a></a>').addClass('toc-item-link').attr('href', `#toc-${i}`);
            let tocOrdinal = $('<div></div>').addClass('txt txt-12 toc-item-ordinal').text(`${i + 1 < 10 ? `0${i + 1}` : i + 1}`).appendTo(tocItem);
            let [ordinal, ...[title]] = headings.eq(i).text().split('. ');
            let tocName = $('<div></div>').addClass('txt txt-16 toc-item-txt').text(`${[ordinal].join('')}`).appendTo(tocItem);

            tocWrap.append(tocItem);
        }
        //mobile
        // $('.toc-head-txt').eq(index).text($('.toc-item-link[href="#toc-0"]').text());

        lenis.on('scroll', function (e) {
            let currScroll = e.scroll;
            for (let i = 0; i < headings.length; i++) {
                let top = headings.eq(i).get(0).getBoundingClientRect().top;
                if (top > 0 && top < ($(window).height() / 5)) {
                    $(`.toc-item-link[href="#toc-${i}"]`).addClass('active');
                    $(`.toc-item-link`).not(`[href="#toc-${i}"]`).removeClass('active');
                    //mobile
                    // $('.toc-head-txt').eq(index).text($(`.toc-item-link[href="#toc-${i}"]`).text());
                }
            }
        });

        $('.toc-item-link').on('click', function (e) {
            e.preventDefault();
            let target = $(this).attr("href");

            lenis.scrollTo(target, {
                offset: -100,
            })

            history.replaceState({}, '', `${window.location.pathname + target}`)
            return false;
        })

        function updateToc() {
            const currentToc = window.location.hash;
            if (!currentToc) return;
            if ($(currentToc).length) {
                setTimeout(() => {
                    $(`.toc-item-link[href="${currentToc}"]`).trigger('click');
                }, 10);
            } else {
                history.replaceState({}, '', window.location.pathname)
            }
        }
        updateToc();
    }

    // Signup Popup
    function signUpPopupInit() {
        $('[data-popup="open"]').on('click', function(e) {
            e.preventDefault();
            let type = $(this).attr('popup-type')
            $(`[popup-content='${type}']`).addClass('active')
            lenis.start();
        })
        $('[data-popup="close"]').on('click', function(e) {
            e.preventDefault();
            $(this).closest('[popup-content]').removeClass('active')
            lenis.stop()
        })
    }
    signUpPopupInit()

    //Footer
    function footerInit() {
        if ($('.sc-home-footer').length) {
            console.log('init footer interaction')
            //Form
            $('.home-footer-form .input-field').on('focus', (e) => {
                e.preventDefault();
                console.log('focus')
                $('.home-footer-line-inner').addClass('on-focus')
            })
            $('.home-footer-form .input-field').on('blur', (e) => {
                e.preventDefault();
                console.log('blur')
                $('.home-footer-line-inner').removeClass('on-focus')
            })

            if (!$('[data-barba-namespace="home"]').length) {
                const removeFooterBg = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-footer',
                        start: 'top bottom',
                        end: `top+=50% bottom`,
                        scrub: true,
                    }
                })
                removeFooterBg
                .fromTo('.header-bg .header-bg-top, .header-bg .header-bg-bot ', {autoAlpha: 1}, {autoAlpha: 0, duration: 2.5}, '0')
            }

            $('[data-ft-head]').on('mouseenter', function(e) {
                e.preventDefault();
                let target = $(this).attr('data-ft-head')

                $('[data-ft-head]').removeClass('active')
                $(this).addClass('active')

                $('[data-ft-tab]').removeClass('active')
                $(`[data-ft-tab="${target}"]`).addClass('active')
            })
        }
    }

    //Misc
    let delayTimeAfterEnter = 1;
    function progressBar() {
        const progressBarTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.main',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
            }
        })
        progressBarTl.to('.header-prog-inner', {y: '28vh', ease: 'none', duration: 2.5})
    }
    function updateStatic() {
        $('[data-date]').html(new Date().getFullYear() )
    }
    updateStatic()

    let isDev, willCheckLegal;
    
    if ($('[data-barba-namespace="notFound"]').length) {
        isDev = true;
        willCheckLegal = false;
    } else {
        willCheckLegal = true;
        isDev = false;
    }
    //Start Intro loading
    function introInit() {
        if (isDev) {
            $('.intro-wrap').remove();
            progressBar();
            lenis.scrollTo(0, {duration: .0})
            return;
        }
        let count = {val: 00};
        let loadingDuration = 4;
        let loadPer = loadingDuration / 100;
        let zeroDot = {
            outer: 0.325,
            mid: 0.425,
            inner: 0.618,
        }
        let midBreak = 65;

        const introTl = gsap.timeline({
            delay: .2,
            onStart() {
                lenis.stop()
            },
            onComplete() {
                console.log('doneeee')
                progressBar();
            }
        });

        introTl
        //0%
        .to('.intro-loading-ic-wrap', {autoAlpha: 1, duration: 1, ease: 'none'}, `0`)
        .to('.intro-loading-dot-inner-wrap', {autoAlpha: 1, duration: 1.5, ease: 'none'}, `.1`)
        .to('.intro-loading-dot-mid-wrap', {autoAlpha: 1, duration: 1.5, ease: 'none'}, `.2`)
        .to('.intro-loading-dot-outer-wrap', {autoAlpha: 1, duration: 1.5, ease: 'none'}, `.3`)

        .from('.intro-loading-ic-wrap', {scale: .6, duration: 1.5, ease: 'back.inOut(4)'}, `0`)
        .from('.intro-loading-dot-inner-wrap', {scale: zeroDot.inner, duration: 1.5, ease: 'back.inOut(4)'}, `.1`)
        .from('.intro-loading-dot-mid-wrap', {scale: zeroDot.mid, duration: 1.5, ease: 'back.inOut(4)'}, `.2`)
        .from('.intro-loading-dot-outer-wrap', {scale: zeroDot.outer, duration: 1.5, ease: 'back.inOut(4)'}, `.3`)

        .to('.intro-txt', {autoAlpha: 1, duration: 1, ease: 'power1.inOut'}, '.4')

        // text counter
        .to(count, {
            val: midBreak,
            roundProps: "val",
            duration: loadPer * midBreak,
            ease: 'power1.inOut',
            onUpdate: function () {
                $('.intro-txt').text(count.val < 10 ? `0${count.val}` : count.val)
        }}, `${1.5}`)
        .to(count, {
            val: 100,
            roundProps: "val",
            duration: loadPer * (100 - midBreak),
            ease: 'power1.in',
            onUpdate: function () {
              $('.intro-txt').text(count.val < 10 ? `0${count.val}` : count.val)
        }}, `${loadPer * midBreak + .2}`)

        // circle counter
        .to('.intro-loading-ic circle', {'stroke-dashoffset': (100 - midBreak), duration: loadPer * midBreak, ease: 'power1.inOut'}, `${1.5}`)
        .to('.intro-loading-ic circle', {'stroke-dashoffset': 0, duration: loadPer * (100 - midBreak), ease: 'power1.inOut'}, `${loadPer * midBreak + .2}`)

        // 65%
        .to('.intro-loading-dot-outer-wrap', {scale: zeroDot.outer + ((1 - zeroDot.outer) * (midBreak / 100)), duration: 1.2, ease: 'back.inOut(4)'}, `${loadPer * (midBreak) + .2}`)
        .to('.intro-loading-dot-mid-wrap', {scale: zeroDot.mid + ((1 - zeroDot.mid) * (midBreak / 100)), duration: 1.2, ease: 'back.inOut(4)'}, `${loadPer * (midBreak) + .1}`)
        .to('.intro-loading-dot-inner-wrap', {scale: zeroDot.inner + ((1 - zeroDot.inner) * (midBreak / 100)), duration: 1.2, ease: 'back.inOut(4)'}, `${loadPer * (midBreak)}`)

        // 90%
        .to('.intro-loading-dot-outer-wrap', {autoAlpha: 0, scale: zeroDot.outer + ((1 - zeroDot.outer)* 0), duration: 1, ease: 'back.inOut(3)'}, `${(loadPer * (100 - midBreak)) + (loadPer * midBreak + .2) + .2}`)
        .to('.intro-loading-dot-mid-wrap', {autoAlpha: 0, scale: zeroDot.mid + ((1 - zeroDot.mid) * 0), duration: 1, ease: 'back.inOut(3)'}, `${(loadPer * (100 - midBreak)) + (loadPer * midBreak + .2) + .1}`)
        .to('.intro-loading-dot-inner-wrap', {autoAlpha: 0, scale: zeroDot.inner + ((1 - zeroDot.inner) * 0), duration: 1, ease: 'back.inOut(3)'}, `${(loadPer * (100 - midBreak)) + (loadPer * midBreak + .2)}`)

        .to('.intro-txt, .intro-bot-wrap', {autoAlpha: 0, duration: .4}, `${loadPer * 100 + .3}`)

        // Will check legal or not?
        if (willCheckLegal) {
            introTl
            .to('.intro-loading-ic-wrap', {scale: .4825, duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)

            .from('.legal-wrap .legal-slide-main-btn', {scale: 2.06, duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)
            .to('.legal-wrap .legal-slide-main-btn', {autoAlpha: 1 ,duration: 1, ease: 'power1.in'}, `${loadPer * 100 + .3}`)
            .to('.intro-loading-ic-wrap', {autoAlpha: 0, duration: 1, ease: 'back.inOut(2)'}, `>=0`)

            .from('.legal-wrap .legal-slide-line-main', {scaleX: .8 ,duration: 1, ease: 'power1.in'}, `${loadPer * 100 + .3}`)
            .to('.legal-wrap .legal-slide-line-main', {autoAlpha: 1 ,duration: 1, ease: 'power1.in'}, `${loadPer * 100 + .3}`)

            .to('.legal-wrap .legal-ans-txt', {autoAlpha: 0 ,duration: 1, ease: 'power1.in'}, `${loadPer * 100 + .3}`)

            .to('.legal-wrap .legal-ans-txt', {autoAlpha: 1 ,duration: 1, ease: 'power1.in'}, `${loadPer * 100 + .3}`)

            .from('.legal-wrap .legal-center-wrap', {scale: .1 ,duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)
            .to('.intro-brand-legal-txt', {autoAlpha: 1, duration: 1, ease: 'power1.inOut'}, `${loadPer * 100 + .3}`)

            .to('.intro-bg-x-wrap', {scale: 1, duration: .6, autoAlpha: .5, ease: 'power1.inOut'}, `${loadPer * 100 + .3}`)

            .set('.legal-wrap.pe-none .legal-slider-wrap, .intro-brand-legal-txt', {pointerEvents: 'auto', onComplete() {
                legalInteraction(willCheckLegal)
            }}, `${loadPer * 100}`)

            .to('.legal-top-wrap, .legal-bot-wrap', {autoAlpha: 1, duration: .8}, `${loadPer * 100 + 1}`)
        } else {
            introTl
            //.set('.legal-slide-main-btn ')
            .to('.intro-loading-ic-wrap', {scale: .4825, duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)
            .from('.legal-wrap .legal-slide-main-btn', {scale: 2.06, duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)
            .to('.legal-wrap .legal-slide-main-btn', {autoAlpha: 1 ,duration: 1, ease: 'power1.in', pointerEvents: 'auto', onComplete() {
                legalInteraction(willCheckLegal)
            }}, `${loadPer * 100 + .3}`)
            //.to('.intro-wrap', {autoAlpha: 0, duration: 1, ease: 'power1.out', delay: .3}, `${loadPer * 100 + .3}`)
            .to('.intro-bg-x-wrap', {scale: 1, duration: .6, autoAlpha: .5, ease: 'power1.inOut'}, `${loadPer * 100 + .3}`)
        }
        return introTl
    }
    function legalInteraction(willCheckLegal) {
        if (willCheckLegal) {
            let sliderClamp = ($('.legal-slider-inner').width() / 2) - ($('.legal-ans-txt').width() / 2);
            let threshold = .7;
            let lockBounce = false;
            let bounceBack = false;
            let lockDrag = false;
            Observer.create({
                target: '.legal-slide-main-btn',
                type: 'touch, pointer',
                debounce: false,
                onDrag() {
                    if (lockDrag) {return}
                    let pointerX = ((pointer.x / viewport.width) - 0.5) * $(window).width();
                    let sliderX = gsap.utils.clamp(-sliderClamp, sliderClamp, pointerX);
                    let maskX = (sliderX - sliderClamp) / ( -2 * sliderClamp) * 100;
                    gsap.to('.legal-slide-ic.legal-ic-left', {autoAlpha: 0, duration: .3, ease: 'power1.out'})
                    gsap.to('.legal-slide-ic.legal-ic-right', {autoAlpha: 0, duration: .3, ease: 'power1.out'})
                    if (sliderX >= sliderClamp * threshold) {
                        if (lockBounce == false) {
                            lockBounce = true;
                            bounceBack = true;
                            gsap.to('.legal-slide-main-btn', {x: sliderClamp, duration: .4, ease: 'power1.out'})
                            gsap.to('.legal-slide-line-main', {'--slidePos': 0, duration: .3, ease: 'power1.out'})
                            gsap.to('.legal-ans-txt.mod-yes', {color: '#ffffff', duration: .3, ease: 'power1.out'})
                            setTimeout(() => {
                                lockBounce = false
                            }, 400);
                        }
                    } else if (sliderX <= sliderClamp * -threshold) {
                        if (lockBounce == false) {
                            lockBounce = true;
                            bounceBack = true;
                            gsap.to('.legal-slide-main-btn', {x: -sliderClamp, duration: .4, ease: 'power1.out'})
                            gsap.to('.legal-slide-line-main', {'--slidePos': 100, duration: .3, ease: 'power1.out'})
                            gsap.to('.legal-ans-txt.mod-no', {color: '#ffffff', duration: .3, ease: 'power1.out'})
                            setTimeout(() => {
                                lockBounce = false
                            }, 400);
                        }
                    } else {
                        if (bounceBack == true) {
                            gsap.to('.legal-slide-main-btn', {x: sliderX, duration: .3})
                            gsap.to('.legal-slide-line-main', {'--slidePos': maskX, duration: .3})
                            setTimeout(() => {
                                bounceBack = false;
                            }, 300);
                        } else {
                            gsap.set('.legal-slide-main-btn', {x: sliderX, overwrite: true})
                            gsap.set('.legal-slide-line-main', {'--slidePos': maskX, overwrite: true})
                        }
                        gsap.to('.legal-ans-txt.mod-yes, .legal-ans-txt.mod-no', {color: '#6f6f6f', duration: .3, ease: 'power1.out'})
                    }
                },
                onHover() {
                    gsap.to('.legal-slide-ic', { autoAlpha: 1, duration: .3, ease: 'power1.in'})
                    //gsap.to('.legal-center-outer, .legal-center-sd', {scale: .9, duration: .3, ease: 'back.out(1.7)'})
                },
                onHoverEnd() {
                    gsap.to('.legal-slide-ic', {autoAlpha: 0, duration: .2, ease: 'power1.out', overwrite: true})
                    //gsap.to('.legal-center-outer, .legal-center-sd', {scale: 1, duration: .3, ease: 'back.out(1.7)'})
                },
                onDragStart() {
                    gsap.set('.legal-slide-main-btn', {cursor: 'grabbing'})
                    gsap.to('.legal-center-line', {autoAlpha: 0, duration: .3, ease: 'power1.in'})
                },
                onDragEnd() {
                    console.log('end')
                    gsap.set('.legal-slide-main-btn', {cursor: 'grab'})
                    gsap.to('.legal-slide-ic.legal-ic-left', {autoAlpha: 0, duration: .2, ease: 'power1.out', overwrite: true})
                    lockDrag = true;
                    if (xGetter('.legal-slide-main-btn') >= sliderClamp * threshold) {
                        lockBounce
                        console.log('yes')
                        setTimeout(() => {
                            doneLegal();
                        }, 400);
                    } else if (xGetter('.legal-slide-main-btn') <= sliderClamp * -threshold) {
                    lockDrag = true;
                        console.log('no')
                        setTimeout(() => {
                            failLegal();
                        }, 400);
                    } else {
                        lockDrag = false
                        console.log('neutral')
                        gsap.to('.legal-slide-main-btn', {x: 0, duration: .45, ease: 'back.out(4)', overwrite: true})
                        gsap.to('.legal-slide-line-main', {'--slidePos': 50, duration: .45, ease: 'back.out(4)'})
                        gsap.to('.legal-center-line', {autoAlpha: 1, duration: .45, ease: 'power1.in', delay: .3})
                    }
                }
            })
            $('.legal-slide-main-btn').on('mouseup', function(e) {
                e.preventDefault();
            })
            $('.legal-slide-main-btn').on('mousedown', function(e) {
                e.preventDefault();
            })
        } else {
            gsap.set('.legal-wrap .legal-slide-main-btn', {cursor: 'pointer'})

            $('.legal-wrap .legal-slide-main-btn').on('click', function(e) {
                e.preventDefault();
                doneLegal()
                return false;
            })
        }

    }
    function doneLegal() {
        lenis.start()
        $('.cursor-wrap').addClass('active')
        gsap.set('.legal-wrap.pe-none .legal-slider-wrap, .intro-brand-legal-txt', {pointerEvents: 'none'})
        let afterIntroTl = gsap.timeline({})
        afterIntroTl
        .to('.intro-bg-x-wrap', {scale: 1.4, duration: 1, y: 0, autoAlpha: .5, ease: 'power1.inOut'})
        .to('.intro-wrap', {autoAlpha: 0, duration: 1, ease: 'power1.out'}, '>=-.4')
        soundControl.play($('#Sound').get(0))
    }
    function failLegal() {
        let afterIntroTl = gsap.timeline({})
        afterIntroTl
        .to('.legal-slider-wrap', {autoAlpha: 0, pointerEvents: 'none', duration: 1, ease: 'power1.inOut'})
        .to('.legal-fail-txt', {autoAlpha: 1, pointerEvents: 'auto', duration: 1, ease: 'power1.inOut'}, ' <=.8')
    }
    //End Intro loading

    function inputInteractionInit() {
        //Normal input
        $('.input-wrap .input-field').on('focus', function(e) {
            $(this).parent().addClass('active')
        })
        $('.input-wrap .input-field').on('blur', function(e) {
            $('.input-wrap').removeClass('active')
        })
        $('.input-wrap .input-field').on('keyup', function(e) {
            if ($(this).val() != '') {
                $(this).parent().addClass('filled')
            } else {
                $(this).parent().removeClass('filled')
            }
        })
        $('.input-wrap .input-field').on('change', function(e) {
            console.log($(this).val())
            if ($(this).val() != '') {
                $(this).parent().addClass('filled')
            } else {
                $(this).parent().removeClass('filled')
            }
        })
        //Phone input validate
        $('[type="tel"]').on('input', function(e) {
            let newValue = this.value.replace(new RegExp(/[^\d-.+ ]/,'ig'), "");
            this.value = newValue;
        })

        //Boolean
        $('.input-checkbox-ic-wrap').parent().find('.input-checkbox').val('false')
        console.log($('.input-checkbox-ic-wrap').parent().find('.input-checkbox').val())

        $('.input-checkbox-ic-wrap').on('click', function(e) {
            e.preventDefault();
            console.log('checkbox')
            if ($(this).find('.span-link:hover').length != 1) {
                if ($(this).hasClass('checked')) {
                    $(this).removeClass('checked')
                    $(this).parent('.input-wrap').parent().find('.input-checkbox').val('false')
                } else {
                    $(this).addClass('checked')
                    $(this).parent('.input-wrap').parent().find('.input-checkbox').val('true')
                }
                console.log($(this).parent('.input-wrap').parent().find('.input-checkbox').val())
            } else {
                console.log('link')
            }
        })

        //Dropdown input
        $('.input-wrap .input-dropdown').on('focus', function(e) {
            $(this).parent().addClass('active')
            $(this).parent().find('.input-dropdown-inner').addClass('active')
            $(this).parent().find('.input-ic').addClass('on-open')
        })

        $('.input-wrap .input-dropdown').on('blur', function(e) {
            if ($('.dropdown-item:hover').length != 1) {
                $(this).parent('.input-wrap').find('.input-dropdown-inner').removeClass('active')
                $(this).parent('.input-wrap').find('.input-ic').removeClass('on-open')
                $(this).parent('.input-wrap').removeClass('active')
            }
        })
        $('.dropdown-item').on('click', function(e) {
            e.preventDefault();
            console.log('dropdown')
            let value = $(this).find('.txt').text();
            $(this).closest('.input-wrap').find('.input-dropdown').val(value)
            $(this).closest('.input-wrap').find('.input-dropdown').change()
            $(this).parent().find('.dropdown-item').removeClass('active')
            $(this).addClass('active')
            $(this).closest('.input-dropdown-inner').removeClass('active')
            $(this).closest('.input-wrap.dropdown-wrap').find('.input-ic').removeClass('on-open')
        })
        $('.input-wrap .input-dropdown').on('keyup', function(e) {
            let keyword = $(this).val().toLowerCase()
            console.log(keyword)
            let allItem = $(this).parent('.input-wrap').find('.dropdown-item');
            for (let x = 0; x < allItem.length; x++) {
                if (allItem.eq(x).find('.txt').text().toLowerCase().indexOf(keyword) != -1) {
                    allItem.eq(x).removeClass('hidden')
                } else {
                    allItem.eq(x).addClass('hidden')
                }
            }
            if ($(this).parent('.input-wrap').find('.dropdown-item.hidden').length == allItem.length) {
                $(this).parent('.input-wrap').find('.dropdown-empty').removeClass('hidden')
            } else {
                $(this).parent('.input-wrap').find('.dropdown-empty').addClass('hidden')
            }
        })
        $('.input-wrap .input-dropdown').on('change', function(e) {
            if ($(this).val() != '') {
                $(this).parent('.input-wrap').addClass('filled')
            } else {
                $(this).parent('.input-wrap').removeClass('filled')
            }
        })

        //validate sample
        $('[name="f-name"]').on('keyup', function(e) {
            if ($(this).val() != '') {
                $(this).closest('.account-form-person').find('[data-signup-btn="next"]').removeClass('btn-disable')
            } else {
                $(this).closest('.account-form-person').find('[data-signup-btn="next"]').addClass('btn-disable')
            }
            $('.signup-success-wrap').find('.span-replace').text($(this).val())
        })
    }

    function leaveTransition(data) {
        const tl = gsap.timeline({
            onStart() {
                gsap.set('.trans-txt', {yPercent: 100})
                $('.trans-txt').text($(data.next.container).attr('data-title'))
                //const transTxt = new SplitText('.trans-txt')
            }
        });
        tl
        .to(data.current.container, {opacity: 0, duration: 1, display: 'none'})
        .to('.trans-txt', {yPercent: 0, duration: .6, ease: 'power1.out'}, '0')
        .to('.trans-wrap', {autoAlpha: 1, duration: 1}, '.2')
        return tl
    }
    function enterTransition(data) {
        resetAfterLeave(data)
        const tl = gsap.timeline({
            onComplete() {
                setTimeout(() => {
                    progressBar();
                }, 300);
            }
        });
        tl
        //.from(data.next.container, {opacity: 0, duration: .6})
        .to('.trans-txt', {yPercent: -100, duration: .6, ease: 'power1.in'}, '0')
        .to('.trans-wrap', {autoAlpha: 0, duration: .6}, '1')
        return tl
    }
    function resetBeforeLeave(data) {
        //Reset viewport
        viewport = {
            width: $(window).width(),
            height: $(window).height(),
            pixelRatio: window.devicePixelRatio,
        }

        //Reset popup
        $('[popup-content="signup"]').removeClass('active')
        $('.signup-select-item').removeClass('active')

        resetNav()
        addNavActiveLink(data.next.namespace)

        resetBlogFs()

        if (data.next.namespace == 'openAcount') {
            $('.header-wrap').addClass('hidden')
            $('.header-wrap').addClass('force-hidden')
            $('.nav').addClass('hidden')
        } else {
            $('.header-wrap').removeClass('hidden')
            $('.header-wrap').addClass('force-hidden')
            $('.nav').removeClass('hidden')
        }
        if (data.next.namespace == 'contactUs') {
            $('.header-wrap').addClass('force-hidden')
        } else {
            $('.header-wrap').removeClass('force-hidden')
        }
    }
    function removeAllScrollTrigger() {
        console.log('remove scroll trigger')
        let triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
            trigger.kill();
        });
    }
    function resetAfterLeave(data) {
        console.log('reset');
        //Reset header
        $('.header-wrap').removeClass('dark-mode')
        if (data.current.namespace == 'blogs' && data.next.namespace == 'blogCategory') {
            return;
        } else if (data.next.namespace == 'blogCategory' && data.current.namespace == 'blogs') {
            return;
        } else if (data.next.namespace == 'blogCategory' && data.current.namespace == 'blogCategory') {
            return;
        }
        lenis.scrollTo(0, {duration: .0})
    }
    function setupAfterEnter() {
        console.log('entered, next load page script')
    }

    // Common script
    $('.sound-toggle').on('click', function(e) {
        e.preventDefault();
        if ($(this).hasClass('disable')) {
            soundControl.play($('#Sound').get(0))
            $(this).removeClass('disable')
        } else {
            soundControl.stop($('#Sound').get(0))
            $(this).addClass('disable')
        }

    })

    function initBlogFs() {
        setTimeout(() => {
            cmsload()
            cmsfilter()
            if (!$('.w-page-count').length) {
                $('.blog-pagi-wrap').fadeOut()
            }
        }, 2000);


    }
    function resetBlogFs() {
        window.fsAttributes = null
    }

    //Variables
    let pointer = {x: 0, y: 0};
    const xSetter = (el) => gsap.quickSetter(el, 'x', `px`);
    const ySetter = (el) => gsap.quickSetter(el, 'y', `px`);
    const zRotSetter = (el) => gsap.quickSetter(el, 'rotationZ', `deg`);

    const xGetter = (el) => gsap.getProperty(el, 'x')
    const yGetter = (el) => gsap.getProperty(el, 'y')
    const zRotGetter = (el) => gsap.getProperty(el, 'rotationZ')
    //Variables End

    function customCursorInit() {
        gsap.to('.cursor', {autoAlpha: 1, duration: 1})
        $(window).on('pointermove', function(e) {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        })
        function moveCursor() {
            let iconsX = xGetter('.cursor');
            let iconsY = yGetter('.cursor');
            if ($('.cursor').length) {
                xSetter('.cursor')(lerp(iconsX, pointer.x));
                ySetter('.cursor')(lerp(iconsY, pointer.y));
                requestAnimationFrame(moveCursor)
            }
        }
        requestAnimationFrame(moveCursor)
    }
    customCursorInit();

    function globalNavScrollInit() {
        function isInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= window.innerHeight / 2 - setLength / 14 &&
                rect.bottom <= window.innerHeight /2 + setLength / 14
            );
        }

        if ($(window).width() > 991) {
            lenisNav.on('scroll', function(inst) {
                // navVelo = inst.velocity;
                // if (inst.direction != 0) {
                //     navDirect = inst.direction;
                // }
            })
            lenisNavWrap.on('scroll', function(inst) {
                if ($('.nav').hasClass('active')) {
                    navVelo = inst.velocity;
                    if (inst.direction != 0) {
                        navDirect = inst.direction;
                    }
                }
            })
        }

        //Whole nav scroll trigger anim
        // Observer.create({
        //     target: '.nav',
        //     type: 'wheel,touch,scroll',
        //     lockAxis: true,
        //     axis: 'y',
        //     debounce: false,
        //     onScroll: (self) => {
        //         if (self.velocityY != 0) {
        //             navVelo = self.velocityY / 100;
        //             navDirect = self.velocityY > 0 ? 1 : -1
        //         }
        //         console.log(self.velocityY)
        //     },
        //     onStop() {
        //         navVelo = undefined;
        //     }
        // })
    }
    globalNavScrollInit()

    function globalNav3dInit() {
        const cameraOpt = {
            zPosition: 23,
        }
        const barrelStart = {
            zPosition: 12,
            yPosition: 0,
            xPosition: -1,
            xRotation: 0,
            yRotation: -pi / 50,
            zRotation: pi / 2,
        }
        let lightIntensity = {
            env: .6,
            rim: {
                lr: .6,
                tb: .4
            }
        };
        const scene = new THREE.Scene()

        rendererGlobalNav.domElement.id = 'nav-3d';

        $('.nav-3d-inner').append(rendererGlobalNav.domElement);

        cameraGlobalNav.position.z = cameraOpt.zPosition;

        let rimLeft = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.lr);
        let rimTop = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.tb);
        let rimBottom = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.tb);

        rimLeft.lookAt(0,0,0);
        rimLeft.position.set(5,0,-10);
        rimLeft.scale.set(2,2,2)
        rimLeft.rotation.z = -Math.PI / 2;

        rimTop.lookAt(0,0,0);
        rimTop.position.set(0,20,-10);
        rimTop.scale.set(2,2,2)
        rimTop.rotation.z = Math.PI / 2;

        rimBottom.lookAt(0,0,0);
        rimBottom.position.set(0,-5,-30);
        rimBottom.scale.set(2,2,2)
        rimBottom.rotation.z = -Math.PI / 2;

        const environmentMap = enviromentMapLoad;

        //let barrelNav;
        let outerGroup = new THREE.Group();
        barrelGlobalNav.then((gltf) => {
            barrelNav = gltf.scene
            updateAllMaterial(barrelNav, environmentMap, false)
            updateLight(barrelNav, lightIntensity.env)

            outerGroup.scale.set(2.8,2.8,2.8);
            outerGroup.position.set(barrelStart.xPosition, barrelStart.yPosition, barrelStart.zPosition)
            outerGroup.rotation.set(barrelStart.xRotation, barrelStart.yRotation, barrelStart.zRotation)
            outerGroup.add(barrelNav);
            scene.add(outerGroup)
            scene.add(rimLeft);
            scene.add(rimBottom);
            scene.add(rimTop);
        })

        rendererGlobalNav.setAnimationLoop(animate)
        
        function animate() {
            if (barrelNav) {
                barrelNav.rotation.x = lerp(barrelNav.rotation.x, (1 - (pointer.x / (viewport.width))) * -Math.PI / 16, 0.04)
                barrelNav.rotation.z = lerp(barrelNav.rotation.z, (((pointer.y / (viewport.height)) - 0.5) * 2) * -Math.PI / 40, 0.04)
                if (navVelo != undefined) {
                    barrelNav.rotation.y = lerp(barrelNav.rotation.y, barrelNav.rotation.y + (Math.abs(navVelo) + 1) * navDirect * 0.05, 0.03)
                } else {
                    barrelNav.rotation.y += pi * 0.001;
                }
            }
            rendererGlobalNav.render( scene, cameraGlobalNav );
        }
    }
    if ($(window).width() > 991) {
        globalNav3dInit()
    }
    
    const SCRIPT = {};
    SCRIPT.homeScript = {
        namespace: 'home',
        afterEnter() {
            console.log('enter home')
            function homeHero3dInit() {
                console.log('home hero 3d init')

                let cameraOpt = {
                    zPosition: 23,
                }
                let barrelStart = {
                    zPosition: 19.2,
                    yPosition: -1.9,
                    xRotation: 0,
                    yRotation: 0,
                }
                let lightIntensity = {
                    env: .8,
                    rim: {
                        lr: 1,
                        tb: .4
                    }
                };
                if ($(window).width() < 768) {
                    cameraOpt = {
                        zPosition: 28,
                    }
                    barrelStart = {
                        zPosition: 22.2,
                        yPosition: -2.4,
                        xRotation: 0,
                        yRotation: 0,
                    }
                    lightIntensity = {
                        env: .8,
                        rim: {
                            lr: 1,
                            tb: .4
                        }
                    };  
                }
                const scene = new THREE.Scene()

                rendererHomeHero.domElement.id = 'home-hero-3d';

                $('.embed-home-hero-3d').append(rendererHomeHero.domElement);

                cameraHomeHero.position.z = cameraOpt.zPosition;

                let rimLeft = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.lr);
                let rimRight = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.lr);
                let rimTop = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.tb);

                rimLeft.lookAt(0,0,0);
                rimLeft.position.set(5,0,-10);
                rimLeft.scale.set(2,2,2)
                rimLeft.rotation.z = -Math.PI / 2;

                rimRight.lookAt(0,0,0);
                rimRight.position.set(-5,0,-10);
                rimRight.scale.set(2,2,2)
                rimRight.rotation.z = Math.PI / 2;

                rimTop.lookAt(0,0,0);
                rimTop.position.set(0,4,-24);
                rimTop.scale.set(2,2,2)
                rimTop.rotation.z = Math.PI / 2;

                const environmentMap = enviromentMapLoad;

                let barrel;
                let outerGroup = new THREE.Group();
                barrelHomeHero.then((gltf) => {
                    barrel = gltf.scene
                    updateAllMaterial(barrel, environmentMap, false)
                    updateLight(barrel, lightIntensity.env)

                    barrel.scale.set(2.8,2.8,2.8);
                    barrel.position.set(0, barrelStart.yPosition, barrelStart.zPosition)
                    barrel.rotation.set(barrelStart.xRotation, barrelStart.yRotation, 0)
                    outerGroup.add(barrel);
                    scene.add(outerGroup)
                    scene.add(rimLeft);
                    scene.add(rimRight);
                    scene.add(rimTop);

                    homeHero3dAnim()
                })

                rendererHomeHero.setAnimationLoop(animate)
                function animate() {
                    if (!$('[data-barba-namespace="home"]').length) {
                        return;
                    }
                    if (barrel) {
                        barrel.rotation.y -= pi * 0.001
                    }
                    rendererHomeHero.render( scene, cameraHomeHero );
                }

                function homeHero3dAnim() {
                    const homeHero3dTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.sc-home-hero',
                            start: `top top`,
                            end: `top+=${$(window).height()} top`,
                            scrub: true,
                        }
                    })
                    if ($(window).width() > 768) {
                        homeHero3dTl
                        .to(barrel.rotation, {x: -pi * .2, duration: 2.5, ease: 'power1.in', delay: 0.25})
                        .to(outerGroup.position, {y: -.5, z: 2 , duration: 2.5, ease: 'power1.in', delay: 0.25}, '0')
                    } else {
                        homeHero3dTl
                        .to(barrel.rotation, {x: -pi * .2, duration: 2.5, ease: 'power1.in', delay: 0.25})
                        .to(outerGroup.position, {y: -1, z: 4 , duration: 2.5, ease: 'power1.in', delay: 0.25}, '0')
                    }
                    
                }
            }
            homeHero3dInit();
            function homeDiscor3dInit() {
                console.log('home 3d init')

                let turnOnShadow = true;
                const cameraOpt = {
                    zPosition: 30,
                }
                const barrelStart = {
                    zPosition: 24,
                    xRotation: - pi * .6,
                }
                let lightIntensity = {
                    env: 4.2,
                    rim: {
                        lr: 2,
                        tb: 1
                    }
                };

                const scene = new THREE.Scene();

                rendererHomeDiscor.domElement.id = 'home3d';
                if (turnOnShadow) {
                    rendererHomeDiscor.shadowMap.enabled = true;
                }

                $('.home-3d-wrap').append(rendererHomeDiscor.domElement);

                cameraHomeDiscor.position.z = cameraOpt.zPosition;

                let rimLeft = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.lr);
                let rimRight = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.lr);
                let rimTop = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.tb);
                let rimBottom = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.tb);

                rimLeft.lookAt(0,0,0);
                rimLeft.position.set(5,0,-7);
                rimLeft.scale.set(2,2,2)
                rimLeft.rotation.z = -Math.PI / 2;

                rimRight.lookAt(0,0,0);
                rimRight.position.set(-5,0,-7);
                rimRight.scale.set(2,2,2)
                rimRight.rotation.z = Math.PI / 2;

                rimTop.lookAt(0,0,0);
                rimTop.position.set(0,4,-7);
                rimTop.scale.set(2,2,2)
                rimTop.rotation.z = Math.PI / 2;

                rimBottom.lookAt(0,0,0);
                rimBottom.position.set(0,-4,-7);
                rimBottom.scale.set(2,2,2)
                rimBottom.rotation.z = Math.PI / 2;

                const environmentMap = enviromentMapLoad

                let barrel;
                let barrelFollowMouse = false;
                let barrelIdleMove = false;

                let clock = new THREE.Clock();
                let outerEmpty = new THREE.Group();
                let innerEmpty = new THREE.Group();
                barrelHomeDiscor.then((gltf) => {
                    barrel = gltf.scene

                    updateAllMaterial(barrel, environmentMap, turnOnShadow)
                    updateLight(barrel, lightIntensity.env)
                    barrel.scale.set(2.8,2.8,2.8);
                    innerEmpty.add(barrel);
                    outerEmpty.add(innerEmpty);
                    scene.add(outerEmpty);
                    scene.add(rimLeft);
                    scene.add(rimRight);
                    scene.add(rimTop);
                    scene.add(rimBottom);
                    if (turnOnShadow) {
                        testShadow()
                    }
                    outerEmpty.position.set(0, -1, barrelStart.zPosition)
                    outerEmpty.rotation.set(barrelStart.xRotation, 0, 0)
                    home3DAnimation()
                })

                let shadowPlane, shadowLight;
                function testShadow(debug = false) {
                    shadowLight = new THREE.PointLight( 0xffffff, 10, 0.0 );
                    shadowLight.position.set( -3, 3, 10 );

                    shadowLight.castShadow = true;
                    shadowLight.shadow.radius = 24;
                    shadowLight.lookAt(0,0,0)
                    scene.add( shadowLight );
                    console.log(debug)
                    let shadowLightHelper
                    if (debug) {
                        shadowLightHelper = new THREE.PointLightHelper( shadowLight, 1, 0xff0000)
                        scene.add(shadowLightHelper)
                    }

                    //Set up shadow properties for the light
                    shadowLight.shadow.mapSize.width = 2048; // default
                    shadowLight.shadow.mapSize.height = 2048; // default
                    shadowLight.shadow.camera.near = 0.5; // default
                    shadowLight.shadow.camera.far = 25; // default

                    //Create a plane that receives shadows (but does not cast them)
                    const planeGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
                    let planeMaterial;
                    if (debug) {
                        planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
                    } else {
                        planeMaterial = new THREE.ShadowMaterial( { color: 0x000000 } )
                    }

                    planeMaterial.opacity = 0.05
                    shadowPlane = new THREE.Mesh( planeGeometry, planeMaterial );
                    // plane.rotation.x = - Math.PI / 3;
                    shadowPlane.position.z = -3
                    shadowPlane.receiveShadow = true;
                    scene.add( shadowPlane );
                }

                rendererHomeDiscor.setAnimationLoop(animate)
                function animate() {
                    if (!$('[data-barba-namespace="home"]').length) {
                        return;
                    }
                    if (barrel) {
                        updateLight(barrel, lightIntensity.env)
                        home3DIdle()
                        home3dMouseMove()
                    }
                    rendererHomeDiscor.render( scene, cameraHomeDiscor );
                }

                function home3DIdle() {
                    // self rotate
                    if (barrelIdleMove) {
                        innerEmpty.position.y = lerp(innerEmpty.position.y, Math.sin(clock.getElapsedTime()) * .25, 0.03)
                        innerEmpty.position.z = lerp(innerEmpty.position.z, 0, 0.02)
                        innerEmpty.rotation.x = lerp(innerEmpty.rotation.x, Math.cos(clock.getElapsedTime()) * .125, 0.03)
                        innerEmpty.rotation.y = lerp(innerEmpty.rotation.y, Math.sin(clock.getElapsedTime()) * .125, 0.03)
                        innerEmpty.rotation.z = lerp(innerEmpty.rotation.z, Math.sin(clock.getElapsedTime()) * .125, 0.03)
                    } else {
                        innerEmpty.position.y = lerp(innerEmpty.position.y, 0, 0.03)
                        innerEmpty.position.z = lerp(innerEmpty.position.z, Math.sin(clock.getElapsedTime()) * .125, 0.02)
                        innerEmpty.rotation.x = lerp(innerEmpty.rotation.x, Math.cos(clock.getElapsedTime()) * .0125, 0.03)
                        innerEmpty.rotation.y = lerp(innerEmpty.rotation.y, Math.sin(clock.getElapsedTime()) * .0125, 0.03)
                        innerEmpty.rotation.z = lerp(innerEmpty.rotation.z, Math.sin(clock.getElapsedTime()) * .0125, 0.03)
                    }
                }
                function home3dMouseMove() {
                    if (barrelFollowMouse) {
                        barrel.position.x = lerp(barrel.position.x, - ((pointer.x / (viewport.width) - 0.5) * 2) * 2, 0.01)
                        barrel.position.y = lerp(barrel.position.y, ((pointer.y / (viewport.height) - 0.5) * 2) * (viewport.height / viewport.width) * 2, 0.01)
                        barrel.rotation.y = lerp(barrel.rotation.y, ((pointer.x / (viewport.width) - 0.5) * 2) * Math.PI / 5 , 0.01)
                        barrel.rotation.x = lerp(barrel.rotation.x, ((pointer.y / (viewport.height) - 0.5) * 2) * Math.PI / 5, 0.01)
                    } else {
                        barrel.position.x = lerp(barrel.position.x, 0, 0.02)
                        barrel.position.y = lerp(barrel.position.y, 0, 0.02)
                        barrel.rotation.y = lerp(barrel.rotation.y, 0 , 0.02)
                        barrel.rotation.x = lerp(barrel.rotation.x, 0, 0.02)
                    }
                }

                function home3DAnimation() {
                    const home3dStart = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-3d-stick-wrap',
                            start: 'top bottom-=55%',
                            end: `top+=${$(window).height() * 1.15} bottom-=55%`,
                            scrub: true,
                        }
                    })
                    home3dStart
                    .from(shadowLight, {intensity: 0, duration: 1.5}, '0')
                    .from([rimLeft, rimRight], {intensity: 1, duration: 1.5}, '0')
                    .from([rimTop, rimBottom], {intensity: 0, duration: 1.5}, '0')
                    .from(lightIntensity, {env: .4, duration: 1.5, ease: 'power1.in'}, '0')
                    .fromTo(outerEmpty.position, {y: -1}, {y: 0, duration: 3}, '0')
                    .fromTo(outerEmpty.position, {z: barrelStart.zPosition}, {z: 2, duration: 3 }, '0')
                    .fromTo(outerEmpty.rotation, {x: barrelStart.xRotation, y: 0}, {x: pi / 9, y: - pi / 4, duration: 3, ease: 'none'}, '0')

                    const home3dMidEnd = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-3d-stick-wrap',
                            start: `top+=${$(window).height() * 1.15} bottom-=55%`,
                            endTrigger: '.home-discor-body-wrap.z-index-top',
                            end: `bottom+=50% bottom`,
                            scrub: true,
                            onUpdate(self) {
                                if (self.progress >= 1/4.5) { // This number determine when the idle and mouse movement disables
                                    barrelFollowMouse = false;
                                    barrelIdleMove = false;
                                } else {
                                    barrelFollowMouse = true;
                                    barrelIdleMove = true;
                                }
                            }
                        }
                    })
                    home3dMidEnd
                    .to(shadowPlane.position, {z: -1, duration: 1, ease: 'none'}, '0')
                    .to(shadowLight.position, {x: -.3, y: .8, z: 16, duration: 1, ease: 'none'}, '0')
                    // .to(shadowLight.shadow, {radius: 12, duration: 1, ease: 'none'}, '0')
                    // .to(outerEmpty.position, {z: -1, duration: 1, ease: 'none'}, '0')
                    // .to(outerEmpty.position, {z: 1, duration: 1, ease: 'none'}, '1')
                    // .to(outerEmpty.position, {z: -1, duration: 1, ease: 'none'}, '2')
                    .to(shadowLight.shadow, {radius: 1, duration: 1, ease: 'none'}, '0')
                    .to(outerEmpty.position, {z: 0, ease: 'none', duration: 1},'0')
                    .to(outerEmpty.rotation, {z: pi * .5, y: 0, ease: 'none', duration:1},'0')
                    .to(outerEmpty.rotation, {x: pi * 3.5, ease: 'none', duration: 4.5},'0') //this duration determines the timeline's total duration

                    const home3dMoveTrigger = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-3d-stick-wrap',
                            start: 'top bottom-=105%',
                            onEnter() {
                                barrelFollowMouse = true;
                            },
                            onLeaveBack() {
                                barrelFollowMouse = false
                            }
                        }
                    })
                    const home3dIdleTrigger = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-3d-stick-wrap',
                            start: 'top bottom-=70%',
                            onEnter() {
                                barrelIdleMove = true;
                            },
                            onLeaveBack() {
                                barrelIdleMove = false;
                            }
                        }
                    })
                }
            }
            if ($(window).width() > 991) {
                homeDiscor3dInit();
            }

            // Setup
            function homeSetup() {
                let homeIntroTopOffset = ($(window).height() - $('.home-intro-title-wrap').height()) / 2;
                $('.home-intro-title-wrap').css('top',`${homeIntroTopOffset}px`)
                let homeDocOffsetTop = ($(window).height() - $('.home-doc-title-stick').height()) / 2;
                $('.home-doc-title-stick').css('top',`${homeDocOffsetTop}px`)
            }
            homeSetup()

            function handlePopupFade() {
                const DOM = {
                    popup: $('.discor-popup-inner'),
                    close: $('.mod-discor-popup'),
                    popupContent: $('.discor-popup-content')
                }

                gsap.set(DOM.popup, { autoAlpha: 0, yPercent: 100 })
                const fade = {
                    inOut: (popup, middleFunc) => {
                        let fadeTl = gsap.timeline();
                        fadeTl.to(popup, { autoAlpha: 0, yPercent: 100, duration: 0.6, ease: 'power1.inOut', onComplete() { middleFunc() } })
                        .to(popup, { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: 'power1.inOut' })
                    },
                    out: (popup) => gsap.to(popup, { autoAlpha: 0, yPercent: 100, duration: 0.5, ease: 'power1.inOut' })
                }
                function activePopup(el) {
                    if (el.attr('data-popup-fade') === "open") {
                        el.attr('data-popup-fade', 'close');
                        DOM.popup.removeClass('active')
                        fade.out(DOM.popup);
                    }
                    else if (el.attr('data-popup-fade') === "close") {
                        $('[data-popup-fade]').attr('data-popup-fade', 'close');
                        el.attr('data-popup-fade', 'open');
                        DOM.popup.addClass('active')
                        
                        fade.inOut(DOM.popup, () => {
                            //Add content
                            let content = el.find('.home-discor-data-content')
                            DOM.popup.find('.discor-popup-title').html(content.find('[data-discor="title"]').html())
                            DOM.popup.find('.discor-popup-desc').html(content.find('[data-discor="body"]').html())
                        })
                    }
                }
                function closePopup() {
                    $('[data-popup-fade="open"]').attr('data-popup-fade', 'close');
                    //el.removeClass('active')
                    fade.out(DOM.popup);
                }
                DOM.close.on('click', function(e) {
                    e.preventDefault();
                    closePopup();
                })
                $('[data-popup-fade]').on('click', function(e) {
                    e.preventDefault();
                    activePopup($(this));
                })
            }
            handlePopupFade();

            // Header control
            function homeHeaderControl() {
                const homeHeaderTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-discor',
                        start: `top top+=35%`,
                        endTrigger: '.home-discor-body-wrap.z-index-top',
                        end: `bottom+=${$(window).height() * .95} bottom`,
                        onEnter() {
                            $('.header-wrap').addClass('dark-mode')
                        },
                        onLeave() {
                            $('.header-wrap').removeClass('dark-mode')
                        },
                        onEnterBack() {
                            $('.header-wrap').addClass('dark-mode')
                        },
                        onLeaveBack() {
                            $('.header-wrap').removeClass('dark-mode')
                        }
                    }
                })
            }
            homeHeaderControl()
            // Trigger control
            function homeHeroReplaceText() {
                let vSlide = gsap.timeline({
                    repeat: -1,
                });

                let textHero = {
                    slides: document.querySelectorAll('.home-hero-title-txt-wrap .home-hero-title-txt'),
                    list: document.querySelector('.home-hero-title-txt-wrap'),
                    duration: 0.5,
                }

                textHero.slides.forEach(function (slide, i) {
                    let label = "slide" + i;
                    vSlide.add(label);

                    vSlide.to(textHero.list, {
                        duration: textHero.duration,
                    }, label);
                    let items = slide;
                    vSlide.from(items, {
                        duration: textHero.duration,
                        autoAlpha: 0,
                    }, label);
                    vSlide.to(items, {
                        duration: textHero.duration,
                        autoAlpha: 0,
                    }, "+=1.2");
                });
            }
            homeHeroReplaceText()
            function homeHeroInit() {
                gsap.set('.home-hero-barrel-wrap', {transformOrigin: 'top'});
                const homeHeroTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-hero',
                        start: `top top`,
                        end: `top+=${$(window).height()} top`,
                        scrub: true,
                    }
                })
                homeHeroTl
                .to('.home-hero-bg-wrap', {autoAlpha: 0, duration: 2.5})
                .to('.home-hero-title-wrap', {autoAlpha: 0, yPercent: -150, duration: 2.5, ease: 'power1.in'}, '0.5')
                .to('.home-hero-barrel-wrap', {autoAlpha: 0, yPercent: 100, scale: 1.3, duration: 2.5, ease: 'power1.in'}, '0.5')
            }
            homeHeroInit()

            function homeIntroInit() {
                const homeIntroTitle = new SplitText('.home-intro-title', { type: 'lines, chars'});
                let homeIntroRevealTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-intro-title-stick-wrap',
                        start: 'top top+=50%',
                        end: 'bottom top+=50%',
                        scrub: .6,
                    }
                })
                homeIntroRevealTl
                .to(homeIntroTitle.chars, {color: '#ffffff', duration: .1, stagger: 0.02, ease: Power1.easeOut}, '0')

                let homeIntroTitleWrapTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-intro-title-stick-wrap',
                        start: 'top bottom',
                        end: 'bottom top+=50%',
                        scrub: true,
                    }
                })
                let distance = $('.home-intro-title-stick-wrap').height() - $('.home-intro-title-wrap').height();
                homeIntroTitleWrapTl
                .to('.home-intro-title-wrap', {y: distance, duration: 2.5, ease: 'none'})

                let homeIntroTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-intro-bg-wrap',
                        start: 'top top',
                        endTrigger: '.sc-home-intro',
                        end: 'bottom+=5% bottom+=100%',
                        scrub: true,
                    }
                })
                homeIntroTl
                .from('.home-intro-bg-stick', {yPercent: 85, duration: 10, ease: 'none'})
                .to('.home-intro-bg-stick .img-basic', {filter: 'blur(7px)', autoAlpha: 0, duration: 4}, '>=-4')

                if ($(window).width() > 991) {
                    let homeIntroVideoTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-intro-vid-stick-wrap',
                            start: 'top top+=24%',
                            end: 'bottom bottom-=12%',
                            scrub: .6,
                        }
                    })
                    homeIntroVideoTl
                    .from('.home-intro-vid', {scale: .12, duration: 3, ease: 'none'})
                    .from('.home-vid-ic-wrap', {scale: .4, duration: 3, ease: 'none'}, '0')
                    .from('.home-intro-vid', {boxShadow: '0 0px 10rem rgba(0, 0, 0, 0)', duration: .6}, '2.4')
                }
                
                function homeIntroVideoMouseMove() {
                    if ($(window).width() > 991) {
                        $('.home-intro-vid-overlay').on('pointerover', function(e) {
                            e.preventDefault();
                            if (!$('.home-vid-ic-wrap').hasClass('active')) {
                                $('.home-vid-ic-wrap').addClass('active')
                                $('.cursor-inner').addClass('fade-out')
                            }
                        })
    
                        $('.home-intro-vid-overlay').on('pointerleave', function(e) {
                            e.preventDefault();
                            if ($($('.home-vid-ic-wrap:hover').length != 1)) {
                                $('.home-vid-ic-wrap').removeClass('active')
                                $('.cursor-inner').removeClass('fade-out')
                            }
                            
                        })
    
                        function moveCursor() {
                            let iconsX = xGetter('.home-vid-ic-wrap');
                            let iconsY = yGetter('.home-vid-ic-wrap');
                            let vidBoundary = $('.home-intro-vid-overlay').get(0);
    
                            if ($('.home-vid-ic-wrap').length) {
                                xSetter('.home-vid-ic-wrap')(lerp(iconsX, pointer.x - vidBoundary.getBoundingClientRect().left), 0.01);
                                ySetter('.home-vid-ic-wrap')(lerp(iconsY, pointer.y - vidBoundary.getBoundingClientRect().top), 0.01);
                                requestAnimationFrame(moveCursor)
                            }
                        }
                        requestAnimationFrame(moveCursor)
                    }

                    let pathElement = $('.home-intro-vid-stick-wrap').get(0).getBoundingClientRect()
                    $('.home-intro-vid').on('click', function(e) {
                        e.preventDefault()
                        console.log('click play video')
                        lenis.scrollTo(pathElement.bottom - $(window).height() * .88, {
                            duration: 1.2
                        })
                        startVideo({delay: 1.2});
                    })
                    $('.home-vid-ic-close').on('click', function(e) {
                        e.preventDefault();
                        stopVideo()
                    })
                    function startVideo({video, delay = 1.2}) {
                        if (video) {
                            let el = $(video);
                        }
                        setTimeout(() => {
                            lenis.stop();
                        }, delay * 1000);
                        setTimeout(() => {
                            $('.home-vid-embed-main').addClass('active')
                        }, delay * 500);
                        $('.home-vid-ic-close').addClass('active')
                        $('.header-wrap').addClass('hidden')
                        $('.header-bg').addClass('hidden')
                    }
                    function stopVideo(video) {
                        let el = $(video);
                        lenis.start();
                        $('.home-vid-ic-close').removeClass('active')
                        $('.header-wrap').removeClass('hidden')
                        $('.header-bg').removeClass('hidden')
                        $('.home-vid-embed-main').removeClass('active')
                    }
                }
                homeIntroVideoMouseMove();

            }
            homeIntroInit();
            function homePreInit() {
                let homePreTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-pre-stick-wrap',
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: true,
                    }
                })
                homePreTl
                .fromTo('.home-pre-title:nth-child(1)', {autoAlpha: 0}, {autoAlpha: 1, duration: 2.5})
                .from('.pre-invest-x.right .pre-invest-x-inner', {yPercent: -100, duration: 2.5, ease: Power1.easeOut}, '<=0')
                .to('.home-pre-title:nth-child(1)', {autoAlpha: 0, duration: 2.5})
                .fromTo('.home-pre-title:nth-child(2)', {autoAlpha: 0}, {autoAlpha: 1, duration: 2.5})
                .from('.pre-invest-x.left .pre-invest-x-inner', {yPercent: -100, duration: 2.5, ease: Power1.easeOut}, '<=0')
                .to('.home-pre-title:nth-child(2)', {autoAlpha: 0, duration: 2.5})
            }
            homePreInit();
            function homeInvestInit() {
                let homeInvestTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-invest-stick-wrap',
                        start: 'top top',
                        end: `top+=${$(window).height()} top`,
                        scrub: true,
                    }
                })
                homeInvestTl
                .from('.home-invest-label', {autoAlpha: 0, duration: 2.5})
                .from('.home-invest-title.title-border', {autoAlpha: 0, duration: 5, ease: 'power1.in'}, '<=-.5')
                .from('.home-invest-title-svg-wrap svg path', {drawSVG: '50% 50%', duration: 8, stagger: .25 ,ease: 'power1.inOut'}, '<=0')
                .from('.home-invest-title.title-fill', {autoAlpha: 0, duration: 5, ease: 'power1.in'}, '>=-.25')
                .to('.home-invest-title.title-border', {autoAlpha: 0, duration: 5}, '<=0')
            }
            homeInvestInit()
            function homeInvestMainInit() {
                const homeInvestMainTitle = new SplitText('.home-invest-sub', {type: 'lines, chars'});
                let homeInvestMainTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-invest-sub',
                        start: 'top bottom-=25%',
                        end: 'end end',
                        scrub: true,
                    }
                })
                homeInvestMainTl
                .to(homeInvestMainTitle.chars, {color: '#ffffff', duration: .5, stagger: 0.4})

                let homeInvestMarqueeTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-invest-marquee-stick-wrap',
                        start: 'top+=50% bottom',
                        end: `bottom+=${$(window).height()} top+=75%'`,
                        scrub: true,
                    }
                })
                let distance = $('.home-invest-marquee-stick-wrap').height() - $('.home-invest-marquee').height();
                homeInvestMarqueeTl
                .to('.home-invest-marquee', {y: distance, duration: 5, ease: 'none'})
                .to('.pre-invest-bg-wrap.bg-x .pre-invest-bg:not(.mod-home-cta-mb)', {autoAlpha: 0, yPercent: -15, duration: 5, ease: 'power1.in'}, '0')
                .fromTo('.home-invest-marquee-txt-wrap.from-right .home-invest-marquee-txt', {xPercent: 100}, {xPercent: -100, duration: 10}, '0')
                .fromTo('.home-invest-marquee-txt-wrap.from-left .home-invest-marquee-txt', {xPercent: -100}, {xPercent: 100, duration: 10}, '0')
            }
            homeInvestMainInit()
            function homeInvestStepInit() {
                const homeInvestStepTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-invest-steps',
                        start: 'top top+=90%',
                        end: 'bottom top+=90%',
                        scrub: true,
                    }
                })
                homeInvestStepTl
                .from('.home-pre-invest-wrap .pre-invest-slash.right .pre-invest-slash-inner', {yPercent: -100, duration: 2.5}, '<=0')
                .from('.home-pre-invest-wrap .pre-invest-slash.left .pre-invest-slash-inner', {yPercent: 100, duration: 2.5}, '<=1.5')
                .from('.home-invest-step-item-inner .home-invest-item-step-txt', {autoAlpha: 0, xPercent: 100, duration: 2.5, stagger: 1, ease: "power1.out"}, '0')
                .from('.home-invest-step-item-inner .home-invest-step-number-wrap', {autoAlpha: 0, xPercent: 220, duration: 2.5, stagger: 1, ease: "power1.out"}, '0')
                .from('.home-invest-step-item-inner .home-invest-step-title', {autoAlpha: 0, xPercent: 100, duration: 2.5, stagger: 1, ease: "power1.out"}, '<=0')
                .from('.home-invest-step-item-inner .home-invest-step-para', {autoAlpha: 0, xPercent: 100, duration: 2.5, stagger: 1, ease: "power1.out"}, '<=.2')
                .fromTo('.header-bg .header-bg-top, .header-bg .header-bg-bot ', {autoAlpha: 1}, {autoAlpha: 0, duration: 5.5}, '0')
            }
            homeInvestStepInit()
            function homeDiscorInit() {
                const homeDiscorTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-discor',
                        start: 'top bottom',
                        end: `top+=${$(window).height()} bottom`,
                        scrub: 0,
                    }
                })
                homeDiscorTl
                .to('.home-pre-invest-wrap .pre-invest-bg-wrap.bg-slash .pre-invest-slash', {y: `0` , duration: 2.5, ease: 'none'})
                .to('.home-invest-steps-wrap', {y: `15vh`, duration: 2.5, autoAlpha: 0, ease: 'none'}, '0')
                .to('.sc-home-discor .home-discor-bg-white', {y: `-25vh`, duration: 2.5, ease: 'power1.out'}, '0')

                gsap.set('.home-discor-item', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.home-discor-item-inner-wrap', {transformOrigin: 'top'})
                const homeDiscorTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-discor .home-discor-main-wrap',
                        start: 'top top+=75%',
                        end: 'bottom top+=75%',
                        scrub: true,
                    }
                })
                homeDiscorTitleTl
                .from('.home-discor-item-inner-wrap', {rotationX: -45, autoAlpha: 0, duration: 2.5, stagger: 2})

                if ($(window).width() > 991) {
                    const homeDiscorBodyTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-discor-body-wrap',
                            start: 'top bottom',
                            endTrigger: '.home-discor-bg-item.mod-invest .home-discor-bg-item-img-wrap',
                            end: 'top top',
                            scrub: true,
                        }
                    })
                    homeDiscorBodyTl
                    .fromTo('.home-discor-bg-item.mod-secur .home-discor-bg-item-img-inner', {yPercent: 40}, {yPercent: -40, duration: 2.5})
                    .fromTo('.home-discor-bg-item.mod-distill .home-discor-bg-item-img-inner', {yPercent: -30}, {yPercent: 30, duration: 2.5}, '0')
                }

                function homeInvestStepMouseMove() {
                    $('.home-invest-steps-wrap').on('pointerover', function(e) {
                        e.preventDefault();
                        if (!$('.home-invest-steps-cursor').hasClass('active')) {
                            $('.home-invest-steps-cursor').addClass('active')
                        }
                    })

                    $('.home-invest-steps-wrap').on('pointerleave', function(e) {
                        e.preventDefault();
                        $('.home-invest-steps-cursor').removeClass('active')
                    })

                    $('.home-invest-step-item').on('pointerover', function(e) {
                        gsap.to('.home-invest-steps-img', {yPercent: -100 * $(this).index(), duration: .6, ease: 'sine.out', overwrite: true})
                    })

                    if ($(window).width() > 991) {
                        function moveCursor() {
                            let iconsX = xGetter('.home-invest-steps-cursor');
                            let iconsY = yGetter('.home-invest-steps-cursor');
                            let iconsZrot = zRotGetter('.home-invest-steps-cursor');
                            let stepsBoundary = $('.home-invest-steps-cursor-wrap').get(0);
    
                            if ($('.home-invest-steps-cursor').length) {
                                xSetter('.home-invest-steps-cursor')(lerp(iconsX, (((pointer.x / (viewport.width )) - 0.5) * 40), 0.06));
                                ySetter('.home-invest-steps-cursor')(lerp(iconsY, pointer.y - stepsBoundary.getBoundingClientRect().top , 0.06));
                                zRotSetter('.home-invest-steps-cursor')(lerp(iconsZrot, (((pointer.x / (viewport.width )) - 0.5)) * 24, 0.04))
                                requestAnimationFrame(moveCursor)
                            }
                        }
                        requestAnimationFrame(moveCursor)
                    }
                }
                homeInvestStepMouseMove()

                let allSelectImg = $('.home-discor-bg-item.mod-distill, .home-discor-bg-item.mod-secur')
                allSelectImg.each((index, el) => {
                    gsap.set(el.querySelector('.home-discor-bg-item-img-inner-wrap'), {clipPath: 'inset(20%)'})
                    gsap.set(el.querySelector('.home-discor-bg-item-img-inner-wrap img'), {scale: 1.4, autoAlpha: 0})
                    // let itemLabel
                    // if (el.hasClass('mod-distill')) {
                    //     console.log(true)
                    //     itemLabel = el.querySelector('.heading.home-discor-distill')
                    // } else {
                    //     itemLabel = el.querySelector('.heading.home-discor-secur')
                    // }
                    const howSelectItemImgTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom-=28%',
                        }
                    })
                    howSelectItemImgTl
                    .to(el.querySelector('.home-discor-bg-item-img-inner-wrap'), { clipPath: 'inset(0%)', duration: 1.2, ease: 'expo.out'})
                    .to(el.querySelector('.home-discor-bg-item-img-inner-wrap img'), { scale: 1, duration: 1.2, autoAlpha: 1, ease: 'expo.out'}, '0')
                    //.from(itemLabel, {autoAlpha: 0, y: '4rem', duration: .6, ease: 'power1.out'}, '.6')
                })
            }
            homeDiscorInit();
            function homeDiscorBgInit() {
                if ($(window).width() > 991) {
                    gsap.set('.home-discor-bg-item.mod-invest', {marginLeft: '-19.1145833333vw', marginRight: '-19.1145833333vw', height: '48.43vw'})
                    const homeDiscorBgTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-discor-body-wrap.z-index-top',
                            start: 'bottom-=50% bottom',
                            end: `bottom bottom`,
                            scrub: .4,
                        }
                    })
                    setTimeout(() => {
                        gsap.set('.home-discor-bg-item.mod-invest', {clearProps:'all'})
                        homeDiscorBgTl
                        .to('.home-discor-bg-item.mod-invest', {marginLeft: '-19.1145833333vw', marginRight: '-19.1145833333vw', height: '48.43vw', duration: 2.5, ease: 'power1.inout'})
                        .to('.home-discor-bg-item.mod-invest .home-discor-bg-item-inner', {marginLeft: '0', marginRight: '0', marginTop: '0', duration: 2.5, ease: 'power1.inout'},'0')
                        .to('.home-discor-bg-item.mod-invest .home-discor-invest-grad', {autoAlpha: 1, duration: 2.5}, '0')
                        .to('.home-discor-hover-item.mod-invest', {yPercent: -200, autoAlpha: 0, pointerEvents: 'none', duration: 2.5}, '0')
                        //-19.1145833333vw
                    }, 100);
    
                    const homeDiscorHeaderBgTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-discor-bg-item.mod-invest',
                            start: `top+=${$(window).height() / 4} top`,
                            end: `top+=${$(window).height() * .75} top`,
                            scrub: true,
                        }
                    })
                    homeDiscorHeaderBgTl
                    .fromTo('.header-bg .header-bg-bot', {autoAlpha: 0}, {autoAlpha: 1, duration: 3.5, ease: 'none'})
                    .fromTo('.header-bg .header-bg-top', {autoAlpha: 0}, {autoAlpha: 1, duration: 1.5, ease: 'none'})
                }
            }
            homeDiscorBgInit();
            function homeDocInit() {
                const homeDocTitle = new SplitText('.home-doc-title', { type: 'lines, chars'});
                const homeDocTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-doc',
                        start: 'top top+=25%',
                        end: 'bottom bottom-=25%',
                        scrub: .8,
                    }
                })
                homeDocTl
                .to(homeDocTitle.chars, {color: '#ffffff', duration: .1, stagger: 0.02, ease: Power1.easeOut}, '0')

                const homeDocbgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-doc',
                        start: 'top top',
                        end: `top+=${$(window).height() / 2} top`,
                        scrub: true,
                    }
                })
                homeDocbgTl
                .from('.home-doc-prog-wrap .pre-invest-slash.right .pre-invest-slash-inner', {yPercent: -100, duration: 2.5}, '<=0')
                .from('.home-doc-prog-wrap .pre-invest-slash.left .pre-invest-slash-inner', {yPercent: 100, duration: 2.5}, '<=1.5')

                const homeDocBookTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-doc-book-stick',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.6,
                    }
                })
                homeDocBookTl
                .fromTo('.home-doc-book-stick img', {yPercent: 10, xPercent: -10}, {yPercent: -10, xPercent: 0, duration: 2.5, ease: 'none'})
                //.fromTo('.home-doc-title-wrap', {y: '6.2rem'}, {y: '-6.2rem', duration: 2.5}, '0')

                function homeDocMouseMove() {
                    $('.home-doc-cursor-sticky').on('pointerover', function(e) {
                        e.preventDefault();
                        if (!$('.home-doc-cursor').hasClass('active')) {
                            $('.home-doc-cursor').addClass('active')
                            $('.cursor-inner').addClass('fade-out')
                        }
                    })
                    if ($('.home-doc-cursor').is(':hover')) {
                        $('.home-doc-cursor').addClass('active')
                        $('.cursor-inner').addClass('fade-out')
                    }

                    $('.home-doc-cursor-sticky').on('pointerleave', function(e) {
                        e.preventDefault();
                        $('.home-doc-cursor').removeClass('active')
                        $('.cursor-inner').removeClass('fade-out')
                    })

                    let timeStart, timeHold;
                    gsap.set('.home-doc-cursor-progress', {
                        scale: 1,
                        background: 'conic-gradient(white 0deg, white 0deg, transparent 0deg, transparent)', overwrite: true
                    })
                    $('.home-doc-cursor').on('mousedown', function(e) {
                        e.preventDefault();
                        console.log('down')
                        timeStart = Date.now();
                        let holdDownloadTl = gsap.timeline({
                        })
                        holdDownloadTl
                        .fromTo('.home-doc-cursor-progress', {
                            background: 'conic-gradient(white 0deg, white 0deg, transparent 0deg, transparent)',
                        }, {
                            background: 'conic-gradient(white 0deg, white 360deg, transparent 360deg, transparent)', duration: 2, ease: 'sine.inOut',
                        })
                    })
                    $('.home-doc-cursor').on('mouseup', function(e) {
                        e.preventDefault();
                        undoMouseHold()
                    })

                    $('.home-doc-cursor').on('mouseleave', function(e) {
                        e.preventDefault();
                        //undoMouseHold()
                    })
                    $('.home-doc-cursor').on('click', function(e) {
                        e.preventDefault();
                        console.log(timeHold)
                        if (timeHold >= 2000) {
                            console.log('go to')
                        } else {
                            console.log('not going everywhere')
                        }
                    })
                    function undoMouseHold() {
                        timeHold = Date.now() - timeStart;
                        gsap.to('.home-doc-cursor-progress', {
                            scale: 1,
                            background: 'conic-gradient(white 0deg, white 0deg, transparent 0deg, transparent)', overwrite: true,
                            duration: .3
                        })
                    }

                    function moveCursor() {
                        let iconsX = xGetter('.home-doc-cursor');
                        let iconsY = yGetter('.home-doc-cursor');
                        let stepsBoundary = $('.home-doc-cursor-sticky').get(0);
                        if ($('.home-doc-cursor').length) {
                            xSetter('.home-doc-cursor')(lerp(iconsX, pointer.x, 0.04));
                            ySetter('.home-doc-cursor')(lerp(iconsY, pointer.y - stepsBoundary.getBoundingClientRect().top, 0.04));
                            requestAnimationFrame(moveCursor)
                        }
                    }
                    requestAnimationFrame(moveCursor)
                }
                //homeDocMouseMove()
            }
            homeDocInit()
            function homeProgInit() {
                const homeProgMarqueeTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-prog-marquee',
                        start: 'top bottom',
                        end: `bottom+=${$(window).height() * 2.5} top+=75%`,
                        scrub: true,
                    }
                })
                homeProgMarqueeTl
                .fromTo('.home-prog-marquee-txt-wrap.from-right .home-prog-marquee-txt', {xPercent: 100}, {xPercent: -100, duration: 2.5}, '0')

                const homeProgContentTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-prog-main-stick',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    }
                })
                homeProgContentTl
                .fromTo('.home-prog-img-wrap', {y: '-25vh'}, { y: '25vh',  duration: 2.5, ease: 'power1.inout'})
                .from('.home-prog-main', {y: '25vh', duration: 2.5}, '0')

                const homeProgTitle = new SplitText('.home-prog-title', {type: 'lines, chars'});
                const homeProgTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-prog-title',
                        start: 'top bottom',
                        end: 'bottom top+=45%',
                        scrub: true,
                    }
                })
                homeProgTitleTl
                .from(homeProgTitle.chars, {color: 'rgb(79, 79, 79)', duration: .1, stagger: 0.02, ease: 'power1.out'})

                gsap.set('.home-prog-item', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.home-prog-item-wrap', {transformOrigin: 'top'})
                const homeProgListTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-prog-main-list',
                        start: 'top top+=65%',
                        end: 'bottom top+=65%',
                        scrub: true,
                    }
                })
                homeProgListTl
                .from('.home-prog-item-wrap', {rotationX: -45, autoAlpha: 0, duration: 2.5, stagger: 2},'0')
                .from('.home-prog-main .txt-link', {yPercent:100, autoAlpha: 0, duration: 2.5}, '>=-2')

                const homeProgRemoveContentTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-prog-main-stick-wrap',
                        start: 'bottom top+=35%',
                        end: 'bottom top',
                        scrub: true,
                    }
                })
                homeProgRemoveContentTl
                .to('.home-prog-main-stick-wrap .home-prog-img-stick-wrap', {autoAlpha: 0, duration: 2.5})
                .to('.home-prog-main-stick-wrap .home-prog-main', {autoAlpha: 0, duration: 2.5}, '0.5')

                const homeProgRemoveBgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-prog',
                        start: 'top top+=50%',
                        end: 'bottom bottom',
                        scrub: true,
                    }
                })
                homeProgRemoveBgTl
                .fromTo('.home-doc-prog-wrap .pre-invest-bg-wrap', {autoAlpha: 1}, {autoAlpha: 0, duration: 2.5})

                const removeHeaderBg = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-cta',
                        start: 'top top',
                        end: `top+=${$(window).height()} top`,
                        scrub: true,
                    }
                })
                removeHeaderBg
                .fromTo('.header-bg .header-bg-top, .header-bg .header-bg-bot ', {autoAlpha: 1}, {autoAlpha: 0, duration: 2.5}, '0')

            }
            homeProgInit();
            function homeCtaInit() {
                const homeCtaTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-home-cta',
                        start: `top top`,
                        end: `bottom bottom`,
                        scrub: true,
                    }
                })
                homeCtaTl
                .from('.home-cta-bg-wrap circle', {'stroke-dashoffset': 100, duration: 1})
                .from('.home-cta-bg-wrap .home-cta-bg-line-inner', {transformOrigin: '0%', scaleX: 0, duration: 1}, '<=0')
                .from('.home-cta-bg-wrap .home-cta-bg-line-hl', {autoAlpha: 0, duration: 1.5, stagger: 0.025}, '>=0')

                .from('.home-cta-main > *', {autoAlpha: 0, duration: 1, stagger: .05, y: 20}, '1.5')

                .to('.home-cta-bg-wrap .home-cta-bg-line-hl', {autoAlpha: 0, duration: 1, stagger: 0.025}, '2.5')
                .to('.home-cta-bg-wrap .home-cta-bg-line-inner', {transformOrigin: '100%', scaleX: 0, duration: 1}, '2.5')
                .to('.home-cta-bg-wrap circle:nth-child(1)', {'stroke-dashoffset': -100, duration: 1}, '2.5')
                .to('.home-cta-bg-wrap circle:nth-child(2)', {'stroke-dashoffset': 300, duration: 1}, '2.5')
                .to('.home-cta-main > *', {autoAlpha: 0, filter: 'blur(5px)', duration: 1, y: 0}, '3')
            }
            if ($(window).width() > 991) {
                homeCtaInit()
            }  
        },
        beforeLeave() {
            console.log('leave home')
            // dispose3dThings(sceneHomeHero)
            // dispose3dThings(sceneHomeDiscor)
        },
    }
    SCRIPT.howItWorkScript = {
        namespace: 'howItWork',
        afterEnter() {
            console.log('enter howItWork')
            function howHeroInit() {
                const howHeroTitle = new SplitText('.how-hero-title', { type: 'lines, words'});
                gsap.set(howHeroTitle.lines, {'overflow': 'hidden'})
                gsap.set(howHeroTitle.words, {yPercent: 100})
                const howHeroTl = gsap.timeline({
                    delay: delayTimeAfterEnter
                });
                howHeroTl
                .to(howHeroTitle.words, {yPercent: 0, duration: .6, stagger: 0.04, ease: 'power2.out'})
                .from('.how-hero-img-wrap', {autoAlpha: 0, duration: 1.2, ease: 'power1.inOut'}, '.2')

                const homeHeroImgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-hero-img-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                })
                let offsetVal;
                if ($(window).width > 991) {
                    offsetVal = '-20vh';
                } else if ($(window).width > 768) {
                    offsetVal = '-14rem';
                } else {
                    offsetVal = '-10rem';
                }
                homeHeroImgTl
                .to('.how-hero-img-wrap-inner', {y: offsetVal, duration: 2.5, ease: 'none'})


            }
            howHeroInit()

            function howStepInit() {
                const howStepLabel = new SplitText('.how-step-label', { type: 'lines, words, chars'});
                const howStepTitle = new SplitText('.how-step-title', { type: 'lines, words, chars'});
                gsap.set([howStepTitle.lines, howStepLabel.lines], {overflow: 'hidden'})
                const howStepTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-step-title-wrap',
                        start: 'top bottom-=15%',
                        end: 'bottom top+=35%',
                        scrub: true,
                    }
                })
                howStepTitleTl
                // .from(howStepLabel.words, {yPercent: 45, autoAlpha: 0, duration: .1, stagger: 0.02, ease: 'power1.out'})
                // .from(howStepTitle.words, {yPercent: 45, autoAlpha: 0, duration: .1, stagger: 0.02, ease: 'power1.out'}, '0.1')
                // .from(howStepLabel.chars, {autoAlpha: 0, duration: .1, stagger: 0.02, ease: 'power1.out'})
                .from(howStepTitle.chars, {color: 'rgb(79, 79, 79)', duration: .1, stagger: 0.02, ease: 'power1.out'}, '0.2')

                const howStepItemsTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-step-main',
                        start: 'top top+=85%',
                        end: 'bottom top+=85%',
                        scrub: true,
                    }
                })
                howStepItemsTl
                .from('.home-invest-step-item-inner .home-invest-item-step-txt', {autoAlpha: 0, xPercent: 60, duration: 2.5, stagger: 1, ease: "power1.out"}, '0')
                .from('.home-invest-step-item-inner .home-invest-step-number-wrap', {autoAlpha: 0, xPercent: 140, duration: 2.5, stagger: 1, ease: "power1.out"}, '0')
                .from('.home-invest-step-item-inner .home-invest-step-title', {autoAlpha: 0, xPercent: 60, duration: 2.5, stagger: 1, ease: "power1.out"}, '<=0')
                .from('.home-invest-step-item-inner .home-invest-step-para', {autoAlpha: 0, xPercent: 60, duration: 2.5, stagger: 1, ease: "power1.out"}, '<=.2')

                const howStepBgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-how-steps .pre-invest-bg-wrap',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    }
                })
                howStepBgTl
                .from('.sc-how-steps .pre-invest-bg', {yPercent: -25, duration: 2.5, ease: 'none'})
            }
            howStepInit()
            function howSelectInit() {
                let allSelectImg = $('.how-select-item-wrap');
                allSelectImg.each((index, el) => {
                    gsap.set(el.querySelector('.how-select-item-img-wrap'), {clipPath: 'inset(20%)'})
                    gsap.set(el.querySelector('.how-select-item-img'), {scale: 1.4, autoAlpha: 0})
                    const howSelectItemImgTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom-=28%',
                        }
                    })
                    howSelectItemImgTl
                    .to(el.querySelector('.how-select-item-img-wrap'), { clipPath: 'inset(0%)', duration: 1.2, ease: 'expo.out'})
                    .to(el.querySelector('.how-select-item-img'), { scale: 1, duration: 1.2, autoAlpha: 1, ease: 'expo.out'}, 0)
                    .from(el.querySelector('.how-select-item-title'), {autoAlpha: 0, y: '4rem', duration: .6, ease: 'power1.out'}, .6)
                    .from(el.querySelector('.how-select-item-sub'), {autoAlpha: 0, y: '4rem', duration: .6, ease: 'power1.out'}, .7)
                })

                if ($(window).width > 991) {
                    const howSelectTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.sc-how-select',
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        }
                    })
                    howSelectTl
                    .from('.how-select-title-wrap', {yPercent: 15, duration: 2.5, ease: 'none'})
                    .fromTo('.how-select-item-wrap.mod-distill', {yPercent: -35}, {yPercent: 35, duration: 2.5, ease: 'none'}, '0')
                    .fromTo('.how-select-item-wrap.mod-grow', {yPercent: 0}, {yPercent: -10, duration: 2.5, ease: 'none'}, '0')
                    .fromTo('.how-select-item-wrap.mod-market', {yPercent: -35}, {yPercent: 0, duration: 2.5, ease: 'none'}, '0')
                }

                //const howSelectLabel = new SplitText('.how-select-label', { type: 'lines, words, chars'});
                const howSelectTitle = new SplitText('.how-select-title', { type: 'lines, words, chars'});
                const howSelectTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-select-title-wrap',
                        start: 'top bottom-=35%',
                        end: 'bottom top+=10%',
                        scrub: true,
                    }
                })
                howSelectTitleTl
                // .from(howSelectLabel.chars, {autoAlpha: 0, duration: .1, stagger: 0.02, ease: 'power1.out'})
                .from(howSelectTitle.chars, {color: 'rgb(79, 79, 79)', duration: .2, stagger: 0.04, ease: 'power1.out'}, '0')
                if ($(window).width > 991) {
                    howSelectTitleTl
                    .from('.how-select-sub', {yPercent: 15, autoAlpha: 0, duration: 2, ease: 'power1.out'}, '<=1')
                }

            }
            howSelectInit()
            function howCommitInit() {
                const howCommitTitle = new SplitText('.how-commit-title', { type: 'lines, chars'});
                const howCommitTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-commit-title-wrap',
                        start: 'top bottom-=35%',
                        end: 'bottom top+=10%',
                        scrub: true,
                    }
                })
                howCommitTitleTl
                // .from(howSelectLabel.chars, {autoAlpha: 0, duration: .1, stagger: 0.02, ease: 'power1.out'})
                .from(howCommitTitle.chars, {color: 'rgb(79, 79, 79)', duration: .2, stagger: 0.04, ease: 'power1.out'}, '0')
                .from('.how-commit-sub', {yPercent: 15, autoAlpha: 0, duration: 2, ease: 'power1.out'}, '>=-.4')

                const howCommitMainTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-commit-main-wrap',
                        start: 'top bottom-=35%',
                        end: 'bottom bottom-=25%',
                        scrub: true,
                    }
                })
                let animForm;
                if ($(window).width > 991) {
                    animForm = 'center';
                } else {
                    animForm = 'left';
                }
                howCommitMainTl
                .from('.how-commit-main-item .invest-main-ic-wrap', {autoAlpha: 0, yPercent: 25, duration: 2.5, stagger:{each: 1, from: animForm}, ease: 'power1.out'})
                .from('.how-commit-main-item .invest-main-item-title', {autoAlpha: 0, yPercent: 25, duration: 2.5, stagger:{each: 1, from: animForm}, ease: 'power1.out'}, '.2')
                .from('.how-commit-main-item .invest-main-item-sub', {autoAlpha: 0, yPercent: 25, duration: 2.5, stagger:{each: 1, from: animForm}, ease: 'power1.out'}, '.4')
                .from('.invest-main-line', {autoAlpha: 0, duration: 2, ease: 'power1.out'}, '.5')
            }
            howCommitInit()
            function howWhyInit() {
                const howWhyTitle = new SplitText('.how-why-title', { type: 'lines, chars'});
                const howWhyTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-why-title-wrap',
                        start: 'top bottom',
                        end: 'bottom top+=85%',
                        scrub: true,
                    }
                })
                howWhyTitleTl
                .from(howWhyTitle.chars, {color: 'rgb(79, 79, 79)', duration: .2, stagger: 0.04, ease: 'power1.out'}, '0')
                .from('.how-why-sub', {yPercent: 15, autoAlpha: 0, duration: .4, ease: 'power1.out'}, '>=-.1')

                const howWhyTitleWrapTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-why-main-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                })
                howWhyTitleWrapTL
                .to('.how-why-title-wrap', {yPercent: 35, duration: 2.5, ease: 'none'})

                gsap.set('.how-why-main-item-wrap', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.how-why-main-item', {transformOrigin: 'top'})
                const howWhyMainTL = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.how-why-main-wrap',
                        start: 'top bottom',
                        end: 'bottom top+=65%',
                        scrub: true,
                    }
                })
                howWhyMainTL
                .from('.how-why-main-item', {rotationX: -45, autoAlpha: 0, duration: 2.5, stagger: 1}, '0')
            }
            howWhyInit()
        },
        beforeLeave() {
            console.log('leave howItWork')
        },
    }
    SCRIPT.openAccountScript = {
        namespace: 'openAccount',
        afterEnter() {
            console.log('enter openAccount')
            $('.header-wrap').addClass('hidden')
            $('.nav').addClass('hidden')

            function getFormType() {
                let formType = window.location.search.replace('?type=','');
                console.log(formType)
                setupForm(formType)
            }
            getFormType()

            function setupForm(formType) {
                setupStepNav(formType)
                setupStepContent(formType)
                $('.hidden-input input').val(formType)
                console.log($('.hidden-input input').val())
                inputInteractionInit()
                setupStepInteraction()
                setupFormValid()
            }

            function setupFormValid() {
                let lastStep = $('.account-main-form .account-form-person').last()
                lastStep.find('.input-checkbox-ic-wrap').on('click', function(e) {
                    if (lastStep.find('.input-checkbox-ic-wrap.checked').length >= 3) {
                        $('[data-signup-btn="submit"]').removeClass('btn-disable')
                    } else {
                        $('[data-signup-btn="submit"]').addClass('btn-disable')
                    }
                })
            }

            function setupStepNav(formType) {
                let stepsLabel = []
                if (formType == 'individual') {
                    $('.account-step-inner .account-step-item:last-child()').remove()
                    stepsLabel = ['Personal Info', 'Additional Info', 'Accredited Status']
                } else if (formType == 'trust') {
                    stepsLabel = ['Personal Info', 'Trust Info', 'Additional Info', 'Accredited Status']
                } else if (formType == 'joint') {
                    stepsLabel = ['Primary Account Holder', 'Account Holder 2', 'Additional Info', 'Accredited Status']
                } else if (formType == 'corporate') {
                    stepsLabel = ['Personal Info', 'Company Info', 'Additional Info', 'Accredited Status']
                }
                for (let x = 0; x < stepsLabel.length; x++) {
                    $('.account-step-inner .account-step-item').eq(x).find('.account-step-item-label').text(stepsLabel[x])
                }

                if ($(window).width() > 768) {
                    $('.account-step-prog-bar').css('width', `${100 / stepsLabel.length}%`)
                } else {
                    $('.account-step-prog-bar').css('width', `50%`)
                    if (formType == 'individual') {
                        $('.account-step-inner').addClass('mod-mb-3')
                    }
                }
            }
            function setupStepContent(formType) {
                if (formType == 'individual') {
                    $('.account-main-form .account-form-person').eq(1).remove();
                } else if ((formType == 'trust')) {
                    $('.account-main-form .account-form-person').eq(1).find('.account-block-title .span-replace').text('trust fund')
                } else if (formType == 'joint') {
                    $('.account-main-form .account-form-person').eq(1).remove();
                    let personalStep = $('.account-main-form .account-form-person').eq(0).clone();
                    personalStep.insertAfter($('.account-main-form .account-form-person').eq(0));

                    $('.account-main-form .account-form-person').eq(0).find('.account-block-title').text('Primary Account Holder')
                    $('.account-main-form .account-form-person').eq(1).find('.account-block-title').text('Account Holder 2')
                } else if ((formType == 'corporate')) {
                    $('.account-main-form .account-form-person').eq(1).find('.account-block-title .span-replace').text('company')
                }
            }
            function setupStepInteraction() {
                let currentStep = 0;
                let activeStep = 0;
                let stepAmount = $('.account-step-item').length;
                //nav
                $('.account-step-item').removeClass('active')
                $('.account-step-item').removeClass('allow')
                $('.account-step-item').eq(activeStep).addClass('active')
                $('.account-step-item').eq(activeStep).addClass('allow')
                gsap.to('.account-step-prog-bar', {xPercent: activeStep * 100, duration: .4})
                //content
                $('.account-form-person').removeClass('active')
                $('.account-form-person').eq(activeStep).addClass('active')
                console.log(activeStep)

                function activeThisStep(step) {
                    if ($(window).width() > 768) {
                        gsap.to('.account-step-prog-bar', {xPercent: step * 100, duration: .4})
                    } else {
                        gsap.to('.account-step-prog-bar', {xPercent: step * 100 / (stepAmount - 1), duration: .4});
                        lenis.scrollTo('.account-main-inner', {duration: .6})
                    }
                    $('.account-form-person').removeClass('active')
                    $('.account-step-item').removeClass('active')

                    $('.account-form-person').eq(step).addClass('active')
                    $('.account-step-item').eq(step).addClass('active')

                    for (let x = 0; x <= currentStep; x++) {
                        $('.account-step-item').eq(x).addClass('allow')
                    }
                }

                $('.account-step-item').on('click', function(e) {
                    e.preventDefault();
                    let thisStep = $(this).index();
                    if ($(this).hasClass('active')) {
                        return;
                    }
                    if (!$(this).hasClass('allow')) {
                        if (thisStep > currentStep) {
                            return;
                        }
                    }
                    activeStep = thisStep;
                    console.log(activeStep)
                    activeThisStep(activeStep)
                })

                $('[data-signup-btn="next"]').on('click', function(e) {
                    e.preventDefault();
                    activeStep +=1;
                    currentStep +=1;
                    if (activeStep == stepAmount.length) {
                        return;
                    } else {
                        activeThisStep(activeStep)
                    }
                })

                $('[data-signup-btn="submit"]').on('click', function(e) {
                    e.preventDefault();
                    $('.signup-success-wrap').addClass('active')
                })
            }
        },
        beforeLeave() {
            console.log('leave openAccount')
        }
    }
    SCRIPT.contactUsScript = {
        namespace: 'contactUs',
        afterEnter() {
            console.log('enter contactUs')
            $('.contact-add-item-wrap').on('click', function(e) {
                e.preventDefault();
                console.log("click ðŸ‘‰ï¸", $(this))
                let country = $(this).attr('data-map-link');
                $('.contact-add-item-wrap').removeClass('active')
                $(this).addClass('active');

                $('[data-map]').removeClass('active');
                $(`[data-map="${country}"]`).addClass('active')
            })

            inputInteractionInit()
        },
        beforeLeave() {
            console.log('leave contactUs')
        }
    }
    SCRIPT.investmentGuideScript = {
        namespace: 'investmentGuide',
        afterEnter() {
            console.log('enter investmentGuide')

            inputInteractionInit()
            investmentFomrValid()

            function investmentFomrValid() {
                console.log('adsdad')
                $('#investRequire').on('click', function(e) {
                    if ($(this).parent().find('input').val() == 'true') {
                        $('#investmentForm').find('.invest-form-submit-wrap .btn').removeClass('btn-disable')
                    } else {
                        $('#investmentForm').find('.invest-form-submit-wrap .btn').addClass('btn-disable')
                    }
                })
            }

            function investHeroInit() {
                const investHeroTitle = new SplitText('.invest-hero-title', { type: 'lines, chars'});
                const investHeroLabel = new SplitText('.invest-hero-label', { type: 'lines, words'});
                const investtHeroSub = new SplitText('.invest-hero-sub', {type: 'lines, words'});
                const investHeroCircleGrp = $('.invest-hero-book-cir');
                let cirCleGrpSize = {
                    size_1: .667,
                    size_2: .5,
                    size_3: .391,
                    size_4: .3
                }
                gsap.set([investHeroTitle.lines,investHeroLabel.lines,investtHeroSub.lines], {'overflow': 'hidden'})
                gsap.set([investtHeroSub.words,investHeroTitle.chars,investHeroLabel.words], {yPercent: 100})

                const howHeroTl = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    onComplete() {
                        if (viewport.width > 991) investHeroMouseMove();
                    }
                });
                howHeroTl
                .to(investHeroLabel.words, {yPercent: 0, duration: .6, stagger: 0.04, ease: 'power2.out'})
                .to(investHeroTitle.chars, {yPercent: 0, duration: .6, stagger: 0.02, ease: 'power1.out'}, '<=.2')
                .to(investtHeroSub.words, {yPercent: 0, duration: .6, stagger: 0.02, ease: 'power1.out'}, '<=.2')
                .from('.invest-hero-btn-wrap', {autoAlpha: 0, yPercent: 20, duration: .6, ease: 'power1.out'}, '<=.2')
                .from('.invest-hero-book-img-wrap', {rotationZ: '-10deg', scale: .9, autoAlpha: 0, duration: 1, ease: 'back.out(2)', yPercent: 15, clearProps: 'all'}, '.6')
                .from(investHeroCircleGrp[1], {scale: cirCleGrpSize.size_1, autoAlpha: 0, duration: 1.2, ease: 'back.out(2)', clearProps: 'all', yPercent: 30}, '<=.02')
                .from(investHeroCircleGrp[2], {scale: cirCleGrpSize.size_2, autoAlpha: 0, duration: 1.2, ease: 'back.out(2)', clearProps: 'all', yPercent: 30}, '<=.04')
                .from(investHeroCircleGrp[3], {scale: cirCleGrpSize.size_3, autoAlpha: 0, duration: 1.2, ease: 'back.out(2)', clearProps: 'all', yPercent: 30}, '<=.04')
                .from(investHeroCircleGrp[4], {scale: cirCleGrpSize.size_4, autoAlpha: 0, duration: 1.2, ease: 'back.out(2)', clearProps: 'all', yPercent: 30}, '<=.04')

                let offsetDis = 25
                function investHeroMouseMove() {
                    let bookX = xGetter('.invest-hero-book-img-wrap');
                    let bookY = yGetter('.invest-hero-book-img-wrap');
                    let circleX = {
                        cir_1: xGetter(investHeroCircleGrp[1]),
                        cir_2: xGetter(investHeroCircleGrp[2]),
                        cir_3: xGetter(investHeroCircleGrp[3]),
                        cir_4: xGetter(investHeroCircleGrp[4]),
                    }
                    let circleY = {
                        cir_1: yGetter(investHeroCircleGrp[1]),
                        cir_2: yGetter(investHeroCircleGrp[2]),
                        cir_3: yGetter(investHeroCircleGrp[3]),
                        cir_4: yGetter(investHeroCircleGrp[4]),
                    }

                    if ($('.sc-invest-hero').length) {
                        xSetter('.invest-hero-book-img-wrap')(lerp(bookX, ((pointer.x / viewport.width) - 0.5) * 2 * 36), 0.01);
                        ySetter('.invest-hero-book-img-wrap')(lerp(bookY, ((pointer.y / viewport.height) - 0.5) * 2 * 36 * (viewport.height / viewport.width)), 0.01);

                        xSetter(investHeroCircleGrp[1])(lerp(circleX.cir_1, ((pointer.x / viewport.width) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_1), .01);
                        ySetter(investHeroCircleGrp[1])(lerp(circleY.cir_1, ((pointer.y / viewport.height) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_1 * (viewport.height / viewport.width)), .01);

                        xSetter(investHeroCircleGrp[2])(lerp(circleX.cir_2, ((pointer.x / viewport.width) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_2), .01);
                        ySetter(investHeroCircleGrp[2])(lerp(circleY.cir_2, ((pointer.y / viewport.height) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_2 * (viewport.height / viewport.width)), .01);

                        xSetter(investHeroCircleGrp[3])(lerp(circleX.cir_3, ((pointer.x / viewport.width) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_3), .01);
                        ySetter(investHeroCircleGrp[3])(lerp(circleY.cir_3, ((pointer.y / viewport.height) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_3 * (viewport.height / viewport.width)), .01);

                        xSetter(investHeroCircleGrp[4])(lerp(circleX.cir_4, ((pointer.x / viewport.width) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_4), .01);
                        ySetter(investHeroCircleGrp[4])(lerp(circleY.cir_4, ((pointer.y / viewport.height) - 0.5) * 2 * offsetDis * cirCleGrpSize.size_4 * (viewport.height / viewport.width)), .01);

                        requestAnimationFrame(investHeroMouseMove)
                    }
                }
            }
            investHeroInit()

            function investAboutInit() {
                const investAboutTitle = new SplitText('.invest-abt-title', { type: 'lines, chars'});
                let investAboutTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-invest-abt',
                        start: 'top top+=50%',
                        end: 'bottom top+=50%',
                        scrub: .6,
                    }
                })
                investAboutTitleTl
                .to(investAboutTitle.chars, {color: '#ffffff', duration: .1, stagger: 0.02, ease: 'power1.out'}, '0')

                const investAboutBgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-invest-abt',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: .6,
                    }
                })
                investAboutBgTl
                .fromTo('.invest-abt-bg-wrap', {yPercent: -10}, {yPercent: 10, ease: 'none'})
            }
            investAboutInit();

            function investDiscorInit() {
                let allSelectImg = $('.invest-how-item-wrap');
                allSelectImg.each((index, el) => {
                    gsap.set(el.querySelector('.invest-how-item-img-wrap'), {clipPath: 'inset(20%)'})
                    gsap.set(el.querySelector('.invest-how-item-img-wrap .img-basic'), {scale: 1.4, autoAlpha: 0})
                    const investDiscorItemImgTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom-=35%',
                        }
                    })
                    investDiscorItemImgTl
                    .to(el.querySelector('.invest-how-item-img-wrap'), { clipPath: 'inset(0%)', duration: 1.2, ease: 'expo.out'})
                    .to(el.querySelector('.invest-how-item-img-wrap .img-basic'), { scale: 1, duration: 1.2, autoAlpha: 1, ease: 'expo.out'}, 0)

                    const investDiscorTitle = new SplitText(el.querySelector('.invest-how-item-title'), {type: 'lines, chars'});
                    const investDiscorItemTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom-=35%',
                            end: 'bottom bottom-=35%',
                            scrub: true
                        }
                    })
                    investDiscorItemTl
                    .from(investDiscorTitle.chars, {color: '#6f6f6f', duration: .1, stagger: 0.02, ease: 'power1.out'}, '0')

                    const investDiscorItemContentTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: el,
                            start: 'top bottom',
                            end: 'bottom bot',
                            scrub: true
                        }
                    })
                    let offsetVal;
                    if ($(window).width > 768) {
                        offsetVal = '20';
                    } else {
                        offsetVal = '0';
                    }
                    investDiscorItemContentTl
                    .fromTo(el.querySelector('.invest-how-item-content-wrap'), {yPercent: -20}, {yPercent: offsetVal, ease: 'none'})
                })


                const investDiscorItem1Sub = new SplitText('.invest-how-item-body', {type: 'lines, words'})
                const investDiscorItem1Tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.invest-how-item-body',
                        start: 'top bottom-=35%',
                        scrub: true,
                    }
                })
                investDiscorItem1Tl
                .from(investDiscorItem1Sub.lines, {autoAlpha: 0, duration: .3, stagger: 0.01, ease: 'power1.out'})

                gsap.set('.invest-how-item-inner-item-wrap', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.invest-how-item-inner-item', {transformOrigin: 'top'})
                const investDiscorListTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.invest-how-item-inner',
                        start: 'top bottom-=25%',
                        end: 'bottom top+=65%',
                        scrub: true,
                    }
                })
                investDiscorListTl
                .from('.invest-how-item-inner-item', {rotationX: -45, autoAlpha: 0, duration: 2.5, stagger: 1}, '0')


                // const investDiscorSubListTL = gsap.timeline({
                //     scrollTrigger: {
                //         trigger: '.invest-how-item-body',
                //         start: 'top bottom-=35%',
                //         scrub: true,
                //         markers: true
                //     }
                // })
                // investDiscorSubListTL
                // .from(investDiscorItem1Sub.lines, {autoAlpha: 0, duration: .3, stagger: 0.01, ease: 'power1.out'})
            }
            investDiscorInit()

            function investFormInit() {
                const investFormBgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.invest-form-bg-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                })
                investFormBgTl
                .to('.invest-form-bg-wrap .img-basic', {y: '-20vh', duration: 2.5, ease: 'none'})
            }
            investFormInit();

        },
        beforeLeave() {
            console.log('leave investmentGuide')
        }
    }
    SCRIPT.productTemplateScript = {
        namespace: 'productTemplate',
        afterEnter() {
            console.log('enter productTemplate')
            function prodHeroInit() {
                const prodHeroTitle = new SplitText('.prod-hero-title', { type: "lines, words" });
                const prodHeroLabel = new SplitText('.prod-hero-label', { type: "lines, words" });
                const prodHeroSub = new SplitText('.prod-hero-sub', { type: "lines, words" });

                gsap.set([prodHeroTitle.lines, prodHeroLabel.lines, prodHeroSub.lines], {overflow: 'hidden'})
                gsap.set([prodHeroTitle.words, prodHeroLabel.words, prodHeroSub.words], {yPercent: 100});

                const prodHeroTl = gsap.timeline({
                    delay: delayTimeAfterEnter,
                });
                prodHeroTl
                .to(prodHeroLabel.words, {yPercent: 0, duration: .6, stagger: 0.03, ease: 'power1.out'})
                .to(prodHeroTitle.words, { yPercent: 0, duration: .6, stagger: 0.03, ease: 'power1.out'}, '<=.2')
                .to(prodHeroSub.words, {yPercent: 0, duration: .6, stagger: 0.02, ease: 'power1.out'}, '<=.4')
                .from('.prod-hero-btn-wrap', {autoAlpha: 0, yPercent: 20, duration: .6, ease: 'power1.out'}, '<=.2')
            }
            prodHeroInit();

            function prodIntroInit() {
                const prodIntroTitle = new SplitText('.prod-intro-title', {type: 'lines, chars'});
                const prodIntroSub = new SplitText('.prod-intro-sub', {type: 'lines, words'});
                const prodIntroBody = new SplitText('.prod-intro-body', {type: 'lines, words'});

                gsap.set([prodIntroTitle.lines, prodIntroSub.lines], {overflow: 'hidden'})

                const prodTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.prod-intro-title-wrap',
                        start: 'top center',
                    }
                });
                prodTitleTl
                .from(prodIntroTitle.chars, {yPercent: 100, duration: .6, stagger: 0.02, ease: 'power1.out'}, '0')
                .from(prodIntroSub.words, {yPercent: 100, duration: .6, stagger: 0.02, ease: 'power1.out'}, '<=.4')
                .from(prodIntroBody.lines, {autoAlpha: 0, duration: .3, stagger: 0.02, ease: 'power1.out'}, '<=0')

                gsap.set('.prod-intro-inner', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.prod-intro-item', {transformOrigin: 'top'})

                const prodStatisTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.prod-intro-inner',
                        start: 'top top+=80%',
                        end: 'bottom top+=80%',
                    }
                })
                prodStatisTl
                .from('.prod-intro-item', {rotationX: -45, autoAlpha: 0, duration: .8, stagger: .3}, '0')
            }
            prodIntroInit();

            function prodChartInit() {
                const prodChartLabel = new SplitText('.prod-chart-label', {type: 'lines, words'})
                gsap.set(prodChartLabel.lines, {overflow: 'hidden'});
                let prodChartTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-prod-chart',
                        start: 'top top+=36%',
                    }
                })

                gsap.set('.prod-chart-svg svg path', { drawSVG: 0 });
                gsap.set('.prod-line-item-txt-wrap', { overflow: 'hidden' });

                prodChartTl
                .to('.prod-chart-svg svg path', {drawSVG: "100%", duration: 2, ease: 'power2.out' }, '0')
                .to('.prod-chart-grad-wrap', {'--gradPercent': '100%', duration: 2, ease: 'power2.out'}, '0')
                .from('.prod-line-item-txt-wrap *', {autoAlpha: 0, xPercent: -100, stagger: 0.06, duration: .6, ease: 'power1.out'}, '0')
                .from('.prod-line-item', {autoAlpha: 0, stagger: 0.06, duration: .6, ease: 'power1.out'}, '0')
                .from(prodChartLabel.words, {autoAlpha: 0, yPercent: 100, stagger: .02, duration: .6, ease: 'power1.out'}, '0')
            }
            prodChartInit();

            function prodCompInit() {
                const prodCompTitle = new SplitText('.prod-comp-title', {type: 'lines, words'});
                const prodCompSub = new SplitText('.prod-comp-sub', {type: 'lines, words'});
                const prodCompBody = new SplitText('.prod-comp-para', {type: 'lines, words'});


                gsap.set([prodCompTitle.lines], {overflow: 'hidden'})

                const prodCompTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.prod-comp-title-wrap',
                        start: 'top center',
                    }
                })
                prodCompTitleTl
                .from(prodCompTitle.words, {yPercent: 100, duration: .6, stagger: 0.04, ease: 'power1.out'}, '0')
                .from(prodCompSub.lines, {autoAlpha: 0, duration: .3, stagger: 0.02, ease: 'power1.out'}, '<=.2')
                .from(prodCompBody.lines, {autoAlpha: 0, duration: .3, stagger: 0.02, ease: 'power1.out'}, '<=.4')

                gsap.set('.prod-comp-inner', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.prod-comp-item', {transformOrigin: 'top'})

                const prodCompInnerTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.prod-comp-inner',
                        start: 'top top+=80%',
                    }
                })
                prodCompInnerTl
                .from('.prod-comp-item', {rotationX: -45, autoAlpha: 0, duration: .8, stagger: .3}, '0')

                gsap.set('.prod-comp-item-inner, .prod-comp-item-value-wrap', {transformOrigin: 'bottom'})
                const prodCompChartTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.prod-comp-main',
                        start: 'top top+=45%',
                    }
                })
                prodCompChartTl
                .from('.prod-comp-item-inner', {height: '0%', autoAlpha: 0, duration: .6, stagger: .02, ease: 'none'}, '0')
                .from('.prod-comp-item-label', {autoAlpha: 0, yPercent: 100, duration: 1, stagger: .02, ease: 'power1.out'}, '<=.2')

                const prodCompChartTitle = new SplitText('.prod-comp-chart-title', {type: 'lines, words'})
                gsap.set(prodCompChartTitle.lines, {overflow: 'hidden'});
                const prodCompChartTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.prod-comp-chart-title-wrap',
                        start: 'top top+=80%',
                    }
                })
                prodCompChartTitleTl
                .from(prodCompChartTitle.words, {yPercent: 100, autoAlpha: 0, duration: .6, stagger: .02, ease: 'power1.out'})

            }
            prodCompInit();

            function prodTabInit() {
                if (viewport.width > 991) return;
                function fadeContent(index) {
                    $('.prob-tab-row-cell').fadeOut("slow");
                    $('.prod-tab-row.mod-content').each((i, item) => {
                        const tabRowCell = item.querySelectorAll('.prob-tab-row-cell');
                        $(tabRowCell).eq(index).fadeIn("slow");
                    })
                }

                $('.prod-tab-head-txt').on('click', function (e) {
                    e.preventDefault();
                    let index = $(this).index();
                    $('.prod-tab-head-txt').removeClass('active');
                    $(this).addClass('active');
                    fadeContent(index);
                })

                fadeContent(0);
            }
            prodTabInit();

        },
        beforeLeave() {
            console.log('leave productTemplate')
        }
    }
    SCRIPT.blogsScript = {
        namespace: 'blogs',
        afterEnter() {
            console.log('enter blogs')

            initBlogFs();
            inputInteractionInit();
            blogSrchInit()
            //checkUrl()

            function blogSrchInit() {
                $('[data-srch="open"]').on('click', function(e) {
                    $('.blog-srch-wrap').addClass('active')
                    lenis.stop()
                    //
                })
                $('[data-srch="close"]').on('click', function(e) {
                    $('.blog-srch-wrap').removeClass('active')
                    lenis.start()
                    // reset
                    $('[fs-cmsfilter-element="clear-1"]').trigger('click')
                })

                $('.blog-srch-clear-ic.pe-none').on('click', function(e) {

                })

                $('#blog-srch').on('keyup', function(e) {
                    console.log($(this).val())
                    let srchPool = $('[fs-cmsfilter-element="list-1"]');
                    // setTimeout(() => {
                    //     srchPool.each((index, el) => {
                    //         if ($(el).find('[role="listitem"]').length == 0) {
                    //             $(el).closest('.blog-srch-cms-wrap').css('display','none')
                    //         } else {
                    //             $(el).closest('.blog-srch-cms-wrap').css('display','block')
                    //         }
                    //     })
                    // }, 101);
                })

                //Mobile dropdown
                $('.blog-tab-mb-toggle').on('click', function(e) {
                    e.preventDefault();
                    if ($(this).hasClass('on-open')) {
                        $('.blog-tab-links-inner-form').removeClass('active')
                    } else {
                        $('.blog-tab-links-inner-form').addClass('active')
                    }
                })
                $('.blog-tab-mb-toggle')
            }

            function blogHeroInit() {
                const blogHeroLabel = new SplitText('.blog-hero-label', {type: 'lines, words'});
                const blogHeroTitle = new SplitText('.blog-hero-title', { type: 'lines, words' });

                gsap.set([blogHeroLabel.lines, blogHeroTitle.lines], {overflow: 'hidden'})

                const blogHeroTl = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    ease: 'power1.out',
                });

                blogHeroTl
                .from(blogHeroLabel.words, {yPercent: 100, duration: .5 })
                .from(blogHeroTitle.words, {yPercent: 100, duration: .5, stagger: 0.03 }, "<=.3")
            }
            blogHeroInit();

            function blogBodyInit() {
                let startBatchItem;
                if (viewport.width > 991) startBatchItem = '65%'
                else startBatchItem = '85%';

                const blogBodyTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-blog-body',
                        start: 'top top+=65%',
                    }
                })

                blogBodyTl
                .from('.blog-tab-item-txt', {autoAlpha: 0, y: 20, duration: .6, stagger: .12, ease: 'power1.out'})
                .from('.blog-srch-toggle', {autoAlpha: 0, y: 20, duration: .6, ease: 'power1.out' }, '<= .6')

                gsap.set('.blog-main-cms-item', {autoAlpha: 0, y: 20});
                gsap.set('.blog-cate-txt', {autoAlpha: 0, y: 60});
                gsap.set('.blog-item-title-txt', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-info-wrap', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-img-wrap', {clipPath: 'inset(20%)'});
                gsap.set('.blog-item-img-inner', {scale: 1.4, autoAlpha: 0});

                ScrollTrigger.batch('.blog-main-cms-item', {
                    start: `top top+=${startBatchItem}`,
                    batchMax: 3,
                    onEnter: batch => {
                        batch.forEach((item, index) => {
                            let cate = item.querySelector('.blog-cate-txt');
                            let title = item.querySelector('.blog-item-title-txt');
                            let info = item.querySelector('.blog-item-info-wrap');
                            let imageWrap = item.querySelector('.blog-item-img-wrap');
                            let imageInner = item.querySelector('.blog-item-img-inner');

                            let delayItem = (index, initDelay) => index != 0 ? initDelay * (index + 1) : initDelay;
                            let item_tl = gsap.timeline();
                            item_tl
                                .to(item, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 1.6, ease: 'power2.out', overwrite: true })
                                .to(cate, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power2.out', delay: delayItem(index, 0.2), overwrite: true }, '0')
                                .to(title, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 1.8, ease: 'power2.out', delay: delayItem(index, 0.15), overwrite: true }, '<= .1')
                                .to(info, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power2.out', delay: delayItem(index, 0.1), overwrite: true }, '<= .2')
                                .to(imageWrap, {clipPath: 'inset(0%)', duration: 2, ease: 'expo.out', overwrite: true}, 0.8)
                                .to(imageInner, {scale: 1, duration: 2, autoAlpha: 1, ease: 'expo.out', overwrite: true}, '<=0')
                        })
                    },
                    once: true
                })
            }
            blogBodyInit();

            // function checkUrl() {
            //     let param = window.location.search;
            //     if (param) {
            //         console.log('has param')
            //         $('.blog-tab-links-inner-form [fs-cmsfilter-element="clear"]').removeClass('active')
            //         $('.blog-main-wrap').removeClass('on-main').addClass('on-cate')
            //     } else {
            //         console.log('all')
            //     }
            // }

            function blogInteraction() {
                $('span.blog-tab-item-txt').on('click', (e) => {
                    $('[fs-cmsfilter-element="clear"]').removeClass('active')
                    $('.blog-main-wrap').removeClass('on-main')
                    $('.blog-main-wrap').addClass('on-cate')
                })
                $('.blog-tab-links-inner-form [fs-cmsfilter-element="clear"]').on('click', (e) => {
                    $(this).addClass('active')
                    $('.blog-main-wrap').addClass('on-main')
                    $('.blog-main-wrap').removeClass('on-cate')
                })
            }
            blogInteraction()

        },
        beforeLeave() {
            console.log('leave blogs')
            resetBlogFs()
        }
    }
    SCRIPT.blogTagScript = {
        namespace: 'blogTag',
        afterEnter() {
            console.log('enter blog tag')
            initBlogFs()
            function blogTagHeroInit() {
                const blogTagLabel = new SplitText('.blogtag-hero-result-label', { type: 'lines, words' });
                const blogTagTitle = new SplitText('.blogtag-hero-result-title', { type: 'lines, words' });

                gsap.set([blogTagLabel.lines, blogTagTitle.lines], { overflow: 'hidden' });

                const tlBlogTag = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    ease: 'power1.out'
                });

                tlBlogTag
                .from('.blogau-hero-brcr', { autoAlpha: 0, duration: 1.2 })
                .from(blogTagLabel.words, { autoAlpha: 0, yPercent: 100, duration: .7 }, '<= .05')
                .from(blogTagTitle.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .05 }, '<= .2')
            }
            blogTagHeroInit();

            function blogTagBodyInit() {
                let startBatchItem;
                if (viewport.width > 991) startBatchItem = '65%'
                else startBatchItem = '85%';

                gsap.set('.blogtag-article-cms-item', { autoAlpha: 0, y: 20 });
                gsap.set('.blog-cate-txt', {autoAlpha: 0, y: 35});
                gsap.set('.blogtag-item-title-txt', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-info-wrap', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-img-wrap', {clipPath: 'inset(20%)'});
                gsap.set('.blog-item-img-inner', { scale: 1.4, autoAlpha: 0 });

                setTimeout(() => {
                    ScrollTrigger.batch('.blogtag-article-cms-item', {
                        start: `top top+=${startBatchItem}`,
                        batchMax: 3,
                        onEnter: batch => {
                            batch.forEach((item, index) => {
                                let cate = item.querySelector('.blog-cate-txt');
                                let title = item.querySelector('.blogtag-item-title-txt');
                                let info = item.querySelector('.blog-item-info-wrap');
                                let imageWrap = item.querySelector('.blog-item-img-wrap');
                                let imageInner = item.querySelector('.blog-item-img-inner');

                                let delayItem = (index, initDelay) => index != 0 ? initDelay * (index + 1) : initDelay;
                                let item_tl = gsap.timeline();
                                item_tl
                                .to(item, {autoAlpha: 1, y: 0, stagger: .2, duration: 1.6, ease: 'power2.out', overwrite: true })
                                .to(cate, {autoAlpha: 1, y: 0, stagger: .2, duration: 1, ease: 'power2.out', delay: delayItem(index, .2), overwrite: true }, '0')
                                .to(title, {autoAlpha: 1, y: 0, stagger: .2, duration: 2, ease: 'power2.out', delay: delayItem(index, .15), overwrite: true }, '<= .1')
                                .to(info, {autoAlpha: 1, y: 0, stagger: .15, duration: 1, ease: 'power2.out', delay: delayItem(index, .08), overwrite: true }, '<= .2')
                                .to(imageWrap, {clipPath: 'inset(0%)', duration: 2, ease: 'expo.out', overwrite: true}, .8)
                                .to(imageInner, { scale: 1, duration: 2, autoAlpha: 1, ease: 'expo.out', overwrite: true }, '<=0')
                            })
                        },
                        once: true
                    })
                }, (delayTimeAfterEnter * 1000))
            }
            blogTagBodyInit();
        },
        beforeLeave() {
            console.log('leave blog tag')
            resetBlogFs()
        }
    }
    SCRIPT.blogCategoryScript = {
        namespace: 'blogCategory',
        afterEnter() {
            console.log('enter blog category')

            initBlogFs();
            inputInteractionInit();

            function blogCateHeroInit() {
                const blogCateHeroLabel = new SplitText('.blog-hero-label', {type: 'lines, words'});
                const blogCateHeroTitle = new SplitText('.blog-hero-title', { type: 'lines, words' });
                gsap.set([blogCateHeroLabel.lines, blogCateHeroTitle.lines], {overflow: 'hidden'})
                const blogCateHeroTl = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    ease: 'power1.out',
                });

                blogCateHeroTl
                .from(blogCateHeroLabel.words, {yPercent: 100, duration: .5 })
                .from(blogCateHeroTitle.words, {yPercent: 100, duration: .5, stagger: 0.03 }, '<=.3')
            }
            blogCateHeroInit();

            function blogCateBodyInit() {
                let startBatchItem;
                if (viewport.width > 991) startBatchItem = '65%'
                else startBatchItem = '85%';

                const blogCateBodyTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-blog-body',
                        start: 'top top+=65%',
                    }
                })

                blogCateBodyTl
                .from('.blog-tab-item-txt', {autoAlpha: 0, y: 20, duration: .6, stagger: .12, ease: 'power1.out'})
                .from('.blog-srch-toggle', {autoAlpha: 0, y: 20, duration: .6, ease: 'power1.out' }, '<= .6')

                gsap.set('.blog-main-cms-item', {autoAlpha: 0, y: 20});
                gsap.set('.blog-cate-txt', {autoAlpha: 0, y: 60});
                gsap.set('.blog-item-title-txt', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-info-wrap', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-img-wrap', {clipPath: 'inset(20%)'});
                gsap.set('.blog-item-img-inner', {scale: 1.4, autoAlpha: 0});

                ScrollTrigger.batch('.blog-main-cms-item', {
                    start: `top top+=${startBatchItem}`,
                    batchMax: 3,
                    onEnter: batch => {
                        batch.forEach((item, index) => {
                            let cate = item.querySelector('.blog-cate-txt');
                            let title = item.querySelector('.blog-item-title-txt');
                            let info = item.querySelector('.blog-item-info-wrap');
                            let imageWrap = item.querySelector('.blog-item-img-wrap');
                            let imageInner = item.querySelector('.blog-item-img-inner');

                            let delayItem = (index, initDelay) => index != 0 ? initDelay * (index + 1) : initDelay;
                            let item_tl = gsap.timeline();
                            item_tl
                            .to(item, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 1.8, ease: 'power2.out', overwrite: true })
                            .to(cate, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 1, ease: 'power2.out', delay: delayItem(index, 0.2), overwrite: true }, '0')
                            .to(title, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 1.8, ease: 'power2.out', delay: delayItem(index, 0.15), overwrite: true }, '<= .1')
                            .to(info, {autoAlpha: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power2.out', delay: delayItem(index, 0.1), overwrite: true }, '<= .2')
                            .to(imageWrap, {clipPath: 'inset(0%)', duration: 2, ease: 'expo.out', overwrite: true}, 0.8)
                            .to(imageInner, {scale: 1, duration: 2, autoAlpha: 1, ease: 'expo.out', overwrite: true}, '<=0')
                        })
                    },
                    once: true
                })
            }
            blogCateBodyInit();
        },
        beforeLeave() {
            console.log('leave blog category')
        }
    }
    SCRIPT.blogAuthorScript = {
        namespace: 'blogAuthor',
        afterEnter() {
            console.log('enter blog author')

            initBlogFs()
            function blogAuthorHeroInit() {
                const blogAuHeroTitle = new SplitText('.blogau-hero-label', { type: 'lines, words' });
                const blogAuHeroName = new SplitText('.blogau-hero-name', { type: 'lines, words' });
                const blogAuHeroDesc = new SplitText('.blogau-hero-desc', { type: 'lines, words' });
                const blogAuArticleTitle = new SplitText('.blogau-article-title', { type: 'lines, words' });

                gsap.set([
                    blogAuHeroTitle.lines,
                    blogAuHeroName.lines,
                    blogAuHeroDesc.lines ], { overflow: 'hidden' })
                gsap.set(blogAuArticleTitle.lines, { overflow: 'hidden', display: 'inline', position: 'relative' })

                const tlBlogAuHero = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    ease: 'power1.out'
                });

                tlBlogAuHero
                .from('.blogau-hero-brcr', { autoAlpha: 0, duration: 1.2 })
                .from(blogAuHeroTitle.words, { autoAlpha: 0, yPercent: 100, duration: .8 }, '<= .05')
                .from(blogAuHeroName.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .05 }, '<= .25')
                .from(blogAuHeroDesc.words, { autoAlpha: 0, yPercent: 100, duration: .8, stagger: .01 }, '<= .05')
                .from('.blogau-hero-img', { clipPath: 'inset(20%)', duration: 2, ease: 'expo.out' }, '<= .15')
                .from('.blogau-hero-img-inner', { scale: 1.4, autoAlpha: 0, duration: 2, ease: 'expo.out' }, '<= 0')
                .from('.blogau-hero-follow-title', { autoAlpha: 0, duration: .8 }, '<= .2')
                .from('.blogau-hero-social-ic', { autoAlpha: 0, scale: 0.6, duration: 1, stagger: .2 }, '<= 0')
                .from(blogAuArticleTitle.words, { autoAlpha: 0, yPercent: 100, duration: 0.9, stagger: .05 }, '<= .2')
            }
            blogAuthorHeroInit();

            function blogAuthorBodyInit() {
                let startBatchItem;
                if (viewport.width > 991) startBatchItem = '65%'
                else startBatchItem = '85%';

                gsap.set('.blogau-article-cms-item', { autoAlpha: 0, y: 20 });
                gsap.set('.blog-cate-txt', {autoAlpha: 0, y: 35});
                gsap.set('.blogau-item-title-txt', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-info-wrap', {autoAlpha: 0, y: 20});
                gsap.set('.blog-item-img-wrap', {clipPath: 'inset(20%)'});
                gsap.set('.blog-item-img-inner', {scale: 1.4, autoAlpha: 0});

                setTimeout(() => {
                    ScrollTrigger.batch('.blogau-article-cms-item', {
                        start: `top top+=${startBatchItem}`,
                        batchMax: 3,
                        onEnter: batch => {
                            batch.forEach((item, index) => {
                                let cate = item.querySelector('.blog-cate-txt');
                                let title = item.querySelector('.blogau-item-title-txt');
                                let info = item.querySelector('.blog-item-info-wrap');
                                let imageWrap = item.querySelector('.blog-item-img-wrap');
                                let imageInner = item.querySelector('.blog-item-img-inner');

                                let delayItem = (index, initDelay) => index != 0 ? initDelay * (index + 1) : initDelay;
                                let item_tl = gsap.timeline();
                                item_tl
                                .to(item, {autoAlpha: 1, y: 0, stagger: .2, duration: 1.8, ease: 'power2.out', overwrite: true })
                                .to(cate, {autoAlpha: 1, y: 0, stagger: .2, duration: 1, ease: 'power2.out', delay: delayItem(index, .2), overwrite: true }, '0')
                                .to(title, {autoAlpha: 1, y: 0, stagger: .2, duration: 2, ease: 'power2.out', delay: delayItem(index, .15), overwrite: true }, '<= .1')
                                .to(info, {autoAlpha: 1, y: 0, stagger: .15, duration: 1, ease: 'power2.out', delay: delayItem(index, .08), overwrite: true }, '<= .2')
                                .to(imageWrap, {clipPath: 'inset(0%)', duration: 2, ease: 'expo.out', overwrite: true}, .8)
                                .to(imageInner, { scale: 1, duration: 2, autoAlpha: 1, ease: 'expo.out', overwrite: true }, '<=0')
                            })
                        },
                        once: true
                    })
                }, (delayTimeAfterEnter * 1000))
            };
            blogAuthorBodyInit();
        },
        beforeLeave() {
            console.log('leave blog author')
        }
    }
    SCRIPT.blogDetailScript = {
        namespace: 'blogDetail',
        afterEnter() {
            console.log("enter blogDetail");

            createToc('.blogdtl-rictxt');
            socialShare('.blogdtl-social-ic')
        },
        beforeLeave() {
            console.log('leave blogDetail')
        }
    }
    SCRIPT.termPolicyTemplateScript = {
        namespace: 'termPolicyTemp',
        afterEnter() {
            console.log("enter termPolicyTemplate");

            createToc('.policy-content-richtext');
        },
        beforeLeave() {
            console.log('leave termPolicyTemplate')
        }
    }
    SCRIPT.notFoundScript = {
        namespace: 'notFound',
        afterEnter() {
            console.log('enter not found page')
            $('a').attr('data-barba-prevent','self')

            function notFoundMarqueeInit() {
                let marqueeItem = $('.notfound-marquee-inner').clone();
                $('.notfound-marquee-wrap').append(marqueeItem.clone());
                $('.notfound-marquee-wrap').append(marqueeItem.clone());
                $('.notfound-marquee-wrap').append(marqueeItem.clone());
                gsap.fromTo('.notfound-marquee-inner', {xPercent: '0'}, {xPercent: -100, duration: 10, repeat: -1, ease: 'none'})
            }
            notFoundMarqueeInit();

            if ($(window).width() > 768) {
                function moveCursor() {
                    let iconsX = xGetter('.notfound-cursor-inner');
                    let iconsY = yGetter('.notfound-cursor-inner');
                    let marqueeY = yGetter('.notfound-marquee-wrap');
                    if ($('.notfound-cursor-inner').length) {
                        xSetter('.notfound-cursor-inner')(lerp(iconsX, pointer.x));
                        ySetter('.notfound-cursor-inner')(lerp(iconsY, pointer.y));
                        ySetter('.notfound-marquee-wrap')(lerp(marqueeY, (((pointer.y / viewport.height) - 0.5) * 2) * -40), .02);
                        requestAnimationFrame(moveCursor)
                    }
                }
                requestAnimationFrame(moveCursor)
            }
        },
        beforeLeave() {
            console.log('leave not found page')
        }
    }
    SCRIPT.partnerScript = {
        namespace: 'partner',
        afterEnter() {
            console.log('enter partner program')
            function partSolutionInit() {
                let animDuration = {
                    sec: 3,
                    milisec: 3000,
                }
                let partSolutionSwiper = new Swiper('.swiper.part-sol-main', {
                    slidesPerView: 1,
                    effect: 'fade',
                    fadeEffect: {
                        crossFade: true
                    },
                    autoplay: {
                        delay: animDuration.milisec
                    }
                })
                partSolutionSwiper.on('activeIndexChange', (swiper) => {
                    console.log(swiper.activeIndex)
                    partSolSwiperAnim(swiper.activeIndex)
                })
                function partSolSwiperAnim(index) {
                    $('.part-sol-main-item-wrap').removeClass('active')
                    $('.part-sol-main-item-wrap').eq(index).addClass('active')
                    gsap.set('.part-sol-prog-inner', {scaleX: 0, overwrite: true})
                    gsap.to('.part-sol-prog-inner', {scaleX: 1, duration: animDuration.sec, ease: 'power1.inOut'})
                }
                partSolSwiperAnim(0)
            }
            partSolutionInit()

            function partMarqueeInit() {
                let homeInvestMarqueeTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.part-marquee-stick-wrap',
                        start: 'top+=75% bottom',
                        end: `bottom+=${$(window).height()} top+=75%'`,
                        scrub: true,
                    }
                })
                let distance = $('.sc-part-marquee').height() - $('.home-invest-marquee').height();
                homeInvestMarqueeTl
                .to('.home-invest-marquee', {y: distance, duration: 5, ease: 'none'})
                .fromTo('.home-invest-marquee-txt-wrap.from-right.mod-part .part-marquee-txt-inner-wrap', {xPercent: 100}, {xPercent: -50, duration: 10}, '0')
                .fromTo('.home-invest-marquee-txt-wrap.from-left.mod-part .part-marquee-txt-inner-wrap', {xPercent: -100}, {xPercent: 50, duration: 10}, '0')
            }
            partMarqueeInit()

            inputInteractionInit()
        },
        beforeLeave() {
            console.log('leave partner program')
        }
    }
    SCRIPT.aboutScript = {
        namespace: 'about',
        afterEnter() {
            console.log('enter about us page')
            function abtHeroSetup() {
                let offsetTop = `${($(window).height() - $('.abt-hero-stick-inner').height()) / 2}px`;
                $('.abt-hero-stick-inner').css('top', offsetTop)
                $('.abt-hero-stick-inner').css('margin-top', offsetTop)
                $('.abt-hero-title-wrap').css('padding-top', offsetTop)
            }
            abtHeroSetup()

            function abtWhyInit() {
                $('.abt-why-item-wrap').on('pointerover', function(e) {
                    gsap.to('.abt-why-img-inner', {yPercent: -100 * $(this).index(), duration: .6, ease: 'sine.out', overwrite: true})
                })
                let abtWhyTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-why-list-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                })
                abtWhyTl
                .to('.abt-why-img-inner-wrap', {yPercent: 100, ease: 'none'})
            }
            abtWhyInit()

        },
        beforeLeave() {
            console.log('leave about us page')
        }
    }

    const VIEWS = [
        SCRIPT.homeScript,
        SCRIPT.howItWorkScript,
        SCRIPT.openAccountScript,
        SCRIPT.contactUsScript,
        SCRIPT.investmentGuideScript,
        SCRIPT.productTemplateScript,
        SCRIPT.blogsScript,
        SCRIPT.blogCategoryScript,
        SCRIPT.blogTagScript,
        SCRIPT.blogAuthorScript,
        SCRIPT.blogDetailScript,
        SCRIPT.termPolicyTemplateScript,
        SCRIPT.notFoundScript,
        SCRIPT.partnerScript,
        SCRIPT.aboutScript
    ]

    barba.init({
        preventRunning: true,
        transitions: [{
            name: 'opacity-transition',
            sync: true,
            once(data) {
                addNavActiveLink(data.next.namespace)
                introInit()
                footerInit()
            },
            async enter(data) {

            },
            async afterEnter(data) {
                footerInit();
                await enterTransition(data)
            },
            async beforeLeave(data) {
                resetBeforeLeave(data)
            },
            async leave(data) {
                await leaveTransition(data).then(() => {
                    removeAllScrollTrigger()
                    setupAfterEnter()
                })
            },
            async afterLeave() {
            }
          }],
        views: VIEWS
    })
}
window.onload = mainScript
