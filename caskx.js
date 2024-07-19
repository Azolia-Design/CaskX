const mainScript = () => {
    dayjs.extend(window.dayjs_plugin_utc)
    dayjs.extend(window.dayjs_plugin_timezone)

    barba.use(barbaPrefetch);
    //Lenis scroll
    let lenis = new Lenis({
        lerp: false,
        duration: 1.8
    });

    ScrollTrigger.config({ ignoreMobileResize: true })
    //ScrollTrigger.normalizeScroll(true);

    let setLength, aSet, lenisNav, lenisNavWrap;
    const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
    }

    $('.nav-main-list').css('overflow-y', 'auto');
    // nav inner infinite scroll init
    setLength = $('.nav-outer').height();
    $('.nav-main-list').css('height',`${setLength}px`)
    if ($(window).width() > 991) {
        if (!isTouchDevice()) {
            $('.nav-main-list').css('pointer-events','none');
            lenisNav = new Lenis({
                lerp: false,
                wrapper: document.querySelector('.nav-main-list'),
                content: document.querySelector('.nav-inner'),
                duration: 1.4,
            })
        } else {
            $('.nav-main-list').attr('data-lenis-prevent','')
        }

        lenisNavWrap = new Lenis({
            lerp: false,
            wrapper: document.querySelector('.nav'),
            content: document.querySelector('.nav-main'),
            duration: 1.4,
            infinite: true
        })
    } else {
        console.log('mobile')
        $('.nav-main').attr('data-lenis-prevent','')
    }

    let navVelo, navDirect, bodyVelo;

    function raf(time) {
        lenis.raf(time)
        if ($(window).width() > 991) {
            if (lenisNav) {
                lenisNav.raf(time)
            }

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

    const viewportBreak = (options) => {
        const { desktop, tablet, mobile } = options;
        let result;
        switch (true) {
            case viewport.width <= 767:
                result = mobile;
                break;
            case viewport.width <= 991:
                result = tablet;
                break;
            default:
                result = desktop;
                break;
        }
        return result;
    }

    function popupSuccessGeneration(success) {
        let { title, sub, cap } = success;
        const popupSelect = (child) => $('.popup-wrap-succ').find(child);

        let newCap = cap
            .replace("sales@caskx.com", `<a href="mailto:sales@caskx.com" class="span-link hover-un mod-mb-block">sales@caskx.com</a>`)
            .replace("+1 (310) 807-5060", `<a href="tel:+1(310)807-5060" class="span-link hover-un mod-mb-block">+1 (310) 807-5060</a>`);

        popupSelect('.popup-title').html(title);
        popupSelect('.popup-sub').html(sub);
        popupSelect('.popup-cap').html(newCap);

        $('.popup-wrap-succ').addClass('active');

        popupSelect('.popup-succ-btn-wrap .btn').on('click', function(e) {
            e.preventDefault();
            $('.popup-wrap-succ').removeClass('active');
        })
    }

    function mapFormToObject(form, originFormData) {
        /** -NOTE-
         * read it: https://stackoverflow.com/questions/12077859/difference-between-this-and-event-target
         * form: this property will be
         *          [e.target]: when the form have event
         *       or [$(formID).get(0)]: when the form don't have event
         */

        let formData = originFormData || new FormData(form);

        const parsedFormData = [...formData.entries()].reduce(
            (prev, cur) => {
                const name = cur[0];
                const val = cur[1];
                let dataName;

                for (let field of form) {
                    let fieldDataName = field.dataset.name;
                    let fieldName = field.name;
                    if (name === fieldName) dataName = fieldDataName;
                }

                return {
                    ...prev, [name]: {
                        value: val,
                        name: dataName,
                        validType: []
                    }
                };
            },
            {}
        );
        return parsedFormData;
    }

    function mapObjectFormToValidate(form, obj) {
        const parsedFormData = [...Object.entries(obj)].reduce((prev, cur) => {
            const name = cur[0];
            const val = cur[1];
            let validArr = val.validType;

            for (let field of form) {
                let fieldName = field.name;
                let fieldType = field.type;
                let fieldRequired = field.required || false;
                let REGEXP_TYPE = ['email', 'phone'];
                if (name === fieldName) {
                    if (fieldRequired) {
                        let CusMessage = field.getAttribute('mess-required');
                        validArr.unshift(required(CusMessage))
                    }
                    if (REGEXP_TYPE.includes(fieldType)) {
                        let CusMessage = field.getAttribute('mess-regexp');
                        let CusRegexp = field.getAttribute('cus-regexp');
                        validArr.unshift(regexp(CusRegexp || fieldType, CusMessage))
                    }
                }
                continue;
            }
            return {
                ...prev, [name]: val
            }
        }, {})
        return parsedFormData;
    }

    const required = (message) => ({ message, required: true });
    const regexp = (pattern, message) => ({ regexp: pattern, message });

    const REGEXP = {
        email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    }

    const ERROR_MESSAGE = {
        required: (name) => `Please fill the ${name} field`,
        regexp: 'Field not like format'
    }

    function validateForm({ formsObj: forms, rules }) {
        const errorObj = {};
        for (let name in rules) {
            for (let rule of rules[name].validType) {
                if (rule.required) {
                    if (!forms[name].value.trim() || forms[name].value.trim() == "false") {
                        errorObj[name] = rule.message || ERROR_MESSAGE.required(forms[name].name);
                    }
                }
                if (rule.regexp && forms[name]) {
                    let regexp = rule.regexp;
                    if (regexp in REGEXP) {
                        regexp = new RegExp(REGEXP[regexp]);
                    }
                    else if (!(regexp instanceof RegExp)) {
                        regexp = new RegExp()
                    }
                    if (!regexp.test(forms[name].value.trim())) {
                        errorObj[name] = rule.message || ERROR_MESSAGE.regexp;
                    }
                }
            }
        }
        return {
            errorObj,
            isValidated: Object.keys(errorObj).length === 0
        };
    }
    const errorValidation = {
        active: (form, errors) => {
            Array.from(form.querySelectorAll('.input-wrap input.w-input')).forEach(node => {
                let errorEl = node.parentElement.lastChild;
                if (errors.hasOwnProperty(node.getAttribute('name'))) {
                    errorEl.innerHTML = errors[node.getAttribute('name')];
                    $(errorEl).slideDown('fast');
                }
                else {
                    $(errorEl).slideUp('fast', () => errorEl.innerHTML = '');
                }
            });
        },
        reset: (form) => {
            Array.from(form.querySelectorAll('.input-wrap input.w-input')).forEach(node => {
                let errorEl = node.parentElement.lastChild;
                $(errorEl).slideUp('fast', () => errorEl.innerHTML = '');
            });
        }
    }

    function buildUrl(formEl) {
        let apiUrl = 'http://intranet.caskx.com/api/forms/submitForm?'
        let formData = new FormData(formEl.get(0));
        let url = new URLSearchParams(formData);
        return apiUrl + url.toString();
    }

    function reInitForm(form) {
        form.trigger('reset');
        $(`#${form.attr('id')} [data-input-url]`).val(window.location.href);
        let accreditedInput = $(`#${form.attr('id')} [data-input-hidden="accredited"]`);
        accreditedInput.val($(`#${form.attr('id')} .radio-input-item input[checked]`).parent().find('.radio-input-txt').text());
    }

    function submitForm(formID, reset) {
        /** -NOTE-
         * read it: https://stackoverflow.com/questions/12077859/difference-between-this-and-event-target
         *  e.target <--> $(formID).get(0)
         *  e.currentTarget <--> $(this) <--> $(formID)
         */
        const form = $(formID);
        const formTarget = $(formID).get(0);
        let success = {
            status: false,
            title: form.attr('data-title-succ') || '',
            sub: form.attr('data-sub-succ') || '',
            cap: form.attr('data-cap-succ') || ''
        };

        const formsObj = mapFormToObject(formTarget);
        const rules = mapObjectFormToValidate(formTarget, formsObj);
        const { errorObj, isValidated } = validateForm({
            formsObj: formsObj,
            rules: rules
        });
        if (isValidated) {
            success.status = true;
            let newWin = window.open(buildUrl(form), '_blank', 'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000,top=10000,width=10,height=10,visible=none', '');
            newWin.blur();
            newWin.close();
            reset?.();
            return { success };
        }
        else {
            success.status = false;
            // alert(errorObj);
            return { errorObj, success };
        }
    }

    function formHandler(formID, options = {}) {
        const { onSuccess, onError } = options;

        $('[data-input-url]').val(window.location.href);
        inputInteractionInit(formID);
        inputRadioInteract(formID);

        $(`${formID} [data-form-btn="submit"]`).on('click', function(e) {
            e.preventDefault();
            $(this).closest('form').trigger('submit');
        })

        $(formID).on('submit', function (e) {
            e.preventDefault();
            const { errorObj: errors, success } = submitForm(formID, () => reInitForm($(this)));
            if (success.status) {
                onSuccess?.(success);
                errorValidation.reset(e.target);
            }
            else {
                onError?.(errors);
                errorValidation.active(e.target, errors);
            }
            return false;
        })
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
    let barrelAboutHero = gltfLoader.loadAsync(modelUrl);
    let barrelNav;

    const cameraHomeHero = new THREE.PerspectiveCamera(40, viewport.width / viewport.height , 0.1, 1000);
    const cameraHomeDiscor = new THREE.PerspectiveCamera(15, viewport.width / viewport.height , 0.1, 1000);
    const cameraAboutHero = new THREE.PerspectiveCamera(15, $('.about-3d-wrap').width() / $('.about-3d-wrap').height() , 0.1, 1000);
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
        rendererHomeHero.setPixelRatio(1)
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

    let rendererAboutHero = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    })
    rendererAboutHero.setSize($('.about-3d-wrap').width(), $('.about-3d-wrap').height());
    if ($(window).width() > 991) {
        rendererAboutHero.setPixelRatio(1)
    } else {
        rendererAboutHero.setPixelRatio(1)
    }
    rendererAboutHero.physicallyCorrectLights = true;
    rendererAboutHero.outputEncoding = THREE.sRGBEncoding;
    rendererAboutHero.toneMapping = THREE.ACESFilmicToneMapping;
    rendererAboutHero.toneMappingExposure = 1.2;

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
        cameraAboutHero.aspect = $('.about-3d-wrap').width() / $('.about-3d-wrap').height();
        cameraAboutHero.updateProjectionMatrix();
        if ($(window).width() > 991) {
            cameraGlobalNav.aspect = $('.nav-3d-inner').width() / $('.nav-3d-inner').height();
            cameraGlobalNav.updateProjectionMatrix();
        }

        rendererHomeHero.setSize( $(window).width(), $(window).height());
        rendererHomeDiscor.setSize( $(window).width(), $(window).height());
        rendererAboutHero.setSize( $('.about-3d-wrap').width(), $('.about-3d-wrap').height());
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
        bodyVelo = inst.velocity
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
        $('.mod-header-logo.mod-icon').addClass('no-filter')
        if ($(window).width() > 991) {
            const posCenter = (setLength - $('.nav-link').height()) / 2;
            if (!$('[data-barba-namespace="termPolicyTemp"]').length) {
                if (lenisNav) {
                    const activeOffsetTop = $('.nav-link.active').get(0).offsetTop;
                    lenisNav.scrollTo(activeOffsetTop - posCenter, { duration: 0 });
                }
            }
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
        gsap.set('.nav-line-inner', { scaleX: 0, autoAlpha: 0 });
        gsap.set('.nav-mb-btn-wrap .btn', { autoAlpha: 0, x: rem(-50) });
        gsap.set('.mod-nav-mb', { autoAlpha: 0, x: rem(-50) });
        gsap.set('.nav-line-inner', { scaleX: 0, autoAlpha: 0 });

        if ($(window).width() > 991) {
            gsap.set(barrelNav.position, { z: 1 });
        }

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
        if ($(window).width() > 991) {
            openNavtl
                .to('.nav-3d-inner', { autoAlpha: 1, duration: 1, ease: 'power2.out' }, .15)
                .to('.nav-3d-grad', { autoAlpha: 1, duration: 1, ease: 'power2.out' }, .15)
                .to(barrelNav.position, {z: 0, duration: 1, ease: 'power1.inOut'}, '<=0')
        }
        openNavtl
        .to('.nav-link', { x: 0, autoAlpha: 1, duration: .6, stagger: 0.04, ease: 'power1.out' }, '>-1.2')
            .to('.nav-mb-btn-wrap .btn', { x: 0, autoAlpha: 1, duration: .6, ease: 'power1.out' }, '0.6')
        if ($(window).width() <= 991) {
            openNavtl.to('.nav-mb-btn-wrap .btn', { x: 0, autoAlpha: 1, duration: .6, ease: 'power1.out' }, '0.6')
            .to('.mod-nav-mb', { x: 0, autoAlpha: 1, duration: .6, ease: 'power1.out' }, '0.65')
        }
        openNavtl.to('.nav-contact-item-wrap', { x: 0, duration: .8, autoAlpha: 1, stagger: 0.04, ease: 'power1.out' }, '<= .2')
        .to('.nav-line-inner', { scaleX: 1, duration: .6, autoAlpha: 1, ease: 'power1.out' }, '<= 0')
    }

    function closeNav(triggerEl) {
        $('.mod-header-logo.mod-icon').removeClass('no-filter')
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
        if ($(window).width() <= 991) {
            closeNavtl.to('.mod-nav-mb', { x: rem(60), autoAlpha: 0, duration: .6, ease: 'power1.out' }, '0.2')
            .to('.nav-mb-btn-wrap .btn', { x: rem(50), autoAlpha: 0, duration: .6, ease: 'power1.out' }, '0.3')
        }
        closeNavtl.to($('.nav-link').get().reverse(), { x: rem(80), autoAlpha: 0, duration: .6, stagger: 0.04, ease: 'power1.out' }, '<= 0.2')
        if ($(window).width() > 991) {
            closeNavtl
                .to(barrelNav.position, { z: -1, duration: .8, ease: 'power1.inOut' }, '0')
                .to('.nav-3d-inner', { autoAlpha: 0, duration: .6, ease: 'power1.out' }, '<=.55')
                .to('.nav-3d-grad', { autoAlpha: 0, duration: .6, ease: 'power1.out' }, '<=0')
        }
        closeNavtl.to('.nav-bg-wrap', { yPercent: 100, duration: 1, ease: 'power1.out' }, '<=.55')
    }
    function resetNav() {
        $('.nav').removeClass('active')
        $('[data-nav]').attr('data-nav', 'open')
        $('[data-nav]').find('.txt-14').text('Menu')
        $('.header-wrap').removeClass('on-nav-open')
        lenis.start()
    }
    function addNavActiveLink(nextPage) {
        console.log(nextPage)
        if (nextPage == 'distilleryDtl') {
            nextPage = 'distillery'
        }
        if (nextPage == 'blogCategory' || nextPage == 'blogAuthor' || nextPage == 'blogDetail' || nextPage == 'blogTag') {
            nextPage = 'blogs'
        }
        $('.nav-link, .home-footer-link').removeClass('active')
        $(`.nav-link[data-nav-link="${nextPage}"]`).addClass('active')
        $(`.home-footer-link[data-nav-link="${nextPage}"]`).addClass('active')
    }
    function updateCurrentClass() {
		$(".w--current").removeClass("w--current");
		$("a").each(function (index) {
			if ($(this).attr("href") === window.location.pathname) {
				$(this).addClass("w--current");
			}
		});
	};
    function toggleHeaderScrollmore(nextPage) {
        if (nextPage == 'home') {
            $('.header-wrap .sub-header .home-hero-scroll-txt').removeClass('hide-trans')
        } else {
            $('.header-wrap .sub-header .home-hero-scroll-txt').addClass('hide-trans')
        }
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
        $('[data-popup="open"]').on('click', function (e) {
            e.preventDefault();
            let type = $(this).attr('popup-type')
            $(`[popup-content='${type}']`).addClass('active')
            lenis.stop()
        })
        $('[data-popup="close"]').on('click', function(e) {
            if (!$('[data-barba-namespace="openAccount"]').length) {
                e.preventDefault();
                let formPopup = $(this).closest('[popup-content]').find('form').get(0);
                $(this).closest('[popup-content]').removeClass('active');
                lenis.start();

                if (!formPopup) return;
                errorValidation.reset(formPopup);
            } else {
                $(this).attr('href', './')
            }
            if ($(this).closest('[popup-content="request"]').length) {
                $(this).closest('[popup-content="request"]').find('form').trigger('reset')
                $(this).closest('[popup-content="request"]').find('form').find('.input-wrap').removeClass('filled active')
            }
        })
    }
    signUpPopupInit()

    //Footer
    function footerInit() {
        if ($('.sc-home-footer').length) {
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
        // 404 page
        isDev = false;
        willCheckLegal = false;
    } else {
        // Default pages
        if (localStorage.getItem("isLegal")) {
            console.log('has legal')
            willCheckLegal = false;
            isDev = false;
        } else {
            console.log('not has legal')
            willCheckLegal = true;
            isDev = false;
        }
    }
    //Start Intro loading
    function introInit() {
        if (isDev) {
            $('.intro-wrap').remove();
            progressBar();
            lenis.scrollTo(0, {duration: .0})
            return;
        }
        let count = {val: 0};
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
                lenis.scrollTo(0, {duration: .0, force: true})
                console.log('force scroll')
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
            $('.legal-center-inner .legal-center-ic').remove()
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
            .to('.intro-brand-legal-txt, .intro-brand-year-txt', {autoAlpha: 1, duration: 1, ease: 'power1.inOut'}, `${loadPer * 100 + .3}`)

            .to('.intro-bg-x-wrap', {scale: 1, duration: .6, autoAlpha: .5, ease: 'power1.inOut'}, `${loadPer * 100 + .3}`)

            .set('.legal-wrap.pe-none .legal-slider-wrap, .intro-brand-legal-txt, .intro-brand-year-txt', {pointerEvents: 'auto', onComplete() {
                legalInteraction(willCheckLegal)
            }}, `${loadPer * 100}`)

            .to('.legal-top-wrap, .legal-bot-wrap', {autoAlpha: 1, duration: .8}, `${loadPer * 100 + 1}`)
        } else {
            $('.legal-top-wrap .h-size32').text("Let's explore lucrative whiskey investments today")
            $('.legal-bot-wrap .home-hero-scroll-txt').remove()

            $('.legal-center-inner .legal-center-line').remove()
            $('.legal-center-inner').addClass('no-legal-check')

            $('.legal-bot-wrap').addClass('pe-auto')
            introTl
            //.set('.legal-slide-main-btn ')
            .to('.intro-loading-ic-wrap', {scale: .4825, duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)
            .from('.legal-wrap .legal-slide-main-btn', {scale: 2.06, duration: 1, ease: 'back.inOut(2)'}, `${loadPer * 100 + .3}`)
            .to('.legal-wrap .legal-slide-main-btn', {autoAlpha: 1 ,duration: 1, ease: 'power1.in', pointerEvents: 'auto', onComplete() {
                legalInteraction(willCheckLegal)
            }}, `${loadPer * 100 + .3}`)
            //.to('.intro-wrap', {autoAlpha: 0, duration: 1, ease: 'power1.out', delay: .3}, `${loadPer * 100 + .3}`)
            .to('.intro-bg-x-wrap', {scale: 1, duration: .6, autoAlpha: .5, ease: 'power1.inOut'}, `${loadPer * 100 + .3}`)
            .to('.legal-top-wrap, .legal-bot-wrap, .intro-brand-year-txt', {autoAlpha: 1, duration: .8}, `${loadPer * 100 + 1}`)
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
        lenis.start();
        refreshAllScrollTrigger()
        localStorage.setItem("isLegal", "true")
        $('.cursor-wrap').addClass('active')
        if (isTouchDevice() || $(window).width() < 991) {
            $('.cursor-wrap').addClass('hidden')
        }
        gsap.set('.legal-wrap.pe-none .legal-slider-wrap, .intro-brand-legal-txt, .intro-brand-year-txt', {pointerEvents: 'none'})
        let afterIntroTl = gsap.timeline({})
        afterIntroTl
        .to('.intro-bg-x-wrap', {scale: 1.4, duration: 1, y: 0, autoAlpha: .5, ease: 'power1.inOut'})
        .to('.intro-wrap', {autoAlpha: 0, duration: 1, ease: 'power1.out'}, '>=-.4')

    }
    function failLegal() {
        let afterIntroTl = gsap.timeline({})
        afterIntroTl
        .to('.legal-slider-wrap', {autoAlpha: 0, pointerEvents: 'none', duration: 1, ease: 'power1.inOut'})
        .to('.legal-fail-txt', {autoAlpha: 1, pointerEvents: 'auto', duration: 1, ease: 'power1.inOut'}, ' <=.8')
    }
    //End Intro loading


    function inputInteractionInit(formEl) {
        //Normal input
        $(`${formEl} .input-wrap .input-field`).on('focus', function(e) {
            $(this).parent().addClass('active')
        })
        $(`${formEl} .input-wrap .input-field`).on('blur', function(e) {
            $('.input-wrap').removeClass('active')
        })
        $(`${formEl} .input-wrap .input-field`).on('keyup', function(e) {
            if ($(this).val() != '') {
                $(this).parent().addClass('filled')
            } else {
                $(this).parent().removeClass('filled')
            }
        })
        $(`${formEl} .input-wrap .input-field`).on('change', function(e) {
            if ($(this).val() != '') {
                $(this).parent().addClass('filled')
            } else {
                $(this).parent().removeClass('filled')
            }
        })
        $(`${formEl} .input-wrap`).each((_,item) => {
            let errorSpan = $('<span></span>').addClass('txt txt-14 input-error');
            $(item).append(errorSpan);
            $(item).find(errorSpan).slideUp();
        })

        // $('.input-wrap .input-field').on('keyup', function(e) {
        //     console.log($(this).val());
        // })
        //Phone input validate
        $(`${formEl} [type="tel"]`).on('input', function(e) {
            let newValue = this.value.replace(new RegExp(/[^\d-.+ ]/,'ig'), "");
            this.value = newValue;
        })

        //Boolean
        $(`${formEl} .input-checkbox`).val('false');
        $(`${formEl} .input-checkbox-ic-wrap`).on('click', function(e) {
            e.preventDefault();
            // console.log('checkbox')
            if ($(this).find('.span-link:hover').length != 1) {
                if ($(this).hasClass('checked')) {
                    $(this).removeClass('checked')
                    $(this).parent('.input-wrap').find('.input-checkbox').val('false')
                } else {
                    $(this).addClass('checked')
                    $(this).parent('.input-wrap').find('.input-checkbox').val('true')
                }
                console.log($(this).parent('.input-wrap').find('.input-checkbox').val())
            } else {
                // console.log('link')
            }
        })
        $(`${formEl} .input-checkbox`).each((_, item) => {
            let defaultCheck = $(item).attr('data-default');
            console.log("defaultCheck 👉️", defaultCheck)
            if (defaultCheck) $(item).parent().find('.input-checkbox-ic-wrap').trigger('click');
        })

        //Dropdown input
        $(`${formEl} .input-wrap .input-dropdown`).on('focus', function(e) {
            $(this).parent().addClass('active')
            $(this).parent().find('.input-dropdown-inner').addClass('active')
            $(this).parent().find('.input-ic').addClass('on-open')
        })

        $(`${formEl} .input-wrap .input-dropdown`).on('blur', function(e) {
            if ($('.dropdown-item:hover').length != 1) {
                $(this).parent('.input-wrap').find('.input-dropdown-inner').removeClass('active')
                $(this).parent('.input-wrap').find('.input-ic').removeClass('on-open')
                $(this).parent('.input-wrap').removeClass('active')
            }
        })
        $(`${formEl} .dropdown-item`).on('click', function(e) {
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
        $(`${formEl} .input-wrap .input-dropdown`).on('keyup', function(e) {
            let keyword = $(this).val().toLowerCase()
            // console.log(keyword)
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
        $(`${formEl} .input-wrap .input-dropdown`).on('change', function(e) {
            if ($(this).val() != '') {
                $(this).parent('.input-wrap').addClass('filled')
            } else {
                $(this).parent('.input-wrap').removeClass('filled')
            }
        })

        //validate sample
        $(`${formEl} [name="First-name"]`).on('keyup', function(e) {
            if ($(this).val() != '') {
                $(this).closest('.account-form-person').find('[data-signup-btn="next"]').removeClass('btn-disable')
            } else {
                $(this).closest('.account-form-person').find('[data-signup-btn="next"]').addClass('btn-disable')
            }
            $('.signup-success-wrap').find('.span-replace').text($(this).val())
        })
    }

    function leaveTransition(data) {
        console.log('leaveTrans')
        const tl = gsap.timeline({
            onStart() {
                gsap.set('.trans-txt', {yPercent: 100})
                $('.trans-txt').text($(data.next.container).attr('data-title'))
            }
        });
        tl
        .to(data.current.container, {opacity: 0, duration: 1, display: 'none'})
        .to('.trans-txt', {yPercent: 0, duration: .6, ease: 'power1.out'}, '0')
        .to('.trans-wrap', {autoAlpha: 1, duration: 1}, '.2')
        //.to('.trans-wrap', {autoAlpha: 1, duration: .2})
        return tl
    }
    function enterTransition(data) {
        resetAfterLeave(data)
        console.log('enterTrans')
        const tl = gsap.timeline({
            delay: 1,
            onComplete() {
                setTimeout(() => {
                    progressBar();
                }, 300);
            }
        });
        tl
        .set('.trans-wrap', {autoAlpha: 1, overwrite: true})
        .set(data.next.container, {autoAlpha: 0}, 0)
        .to(data.next.container, {autoAlpha: 1, duration: 1}, 0)
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
        $('.cursor-inner').removeClass('on-discor')

        //Reset popup
        console.log('reset')
        $('[popup-content="signup"]').removeClass('active')
        $('.signup-select-item').removeClass('active')

        resetNav();
        addNavActiveLink(data.next.namespace);
        signUpPopupInit();
        resetBlogFs();

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
        // console.log('remove scroll trigger')
        let triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
            trigger.kill();
        });
    }
    function refreshAllScrollTrigger() {
        console.log('refresh scroll trigger')
        let triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
            trigger.refresh();
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

    function initBlogFs() {
        updateCurrentClass()
        setTimeout(() => {
            cmsload()
            cmsfilter()
            if (!$('.w-page-count').length) {
                $('.blog-pagi-wrap').fadeOut()
            }
            console.log('init fs')
        }, 3000);
    }
    //initBlogFs()
    function resetBlogFs() {
        console.log('reset fs')
        // if (window.fsAttributes || FsAttributes) {}
        // window.fsAttributes = null
        // fsAttributes = null
        // FsAttributes = null
        // FsAttributes.cmsload.destroy()
        // FsAttributes.filterload.destroy()
        // FsAttributes.destroy()
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
            lenisNavWrap.on('scroll', function(inst) {
                if ($('.nav').hasClass('active')) {
                    navVelo = inst.velocity;
                    if (inst.direction != 0) {
                        navDirect = inst.direction;
                    }
                    if (!isTouchDevice()) {
                        lenisNav.scrollTo(lenisNav.scroll + (inst.velocity * 10))
                    }
                }
            })
        }
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

    function checkFormCheckbox() {
        $('form').find('.input-checkbox-ic-wrap').on('click', function(e) {
            if ($('form').find('.input-checkbox-ic-wrap.checked').length >= 2) {
                $('[data-signup-btn="submit"]').removeClass('btn-disable')
            } else {
                $('[data-signup-btn="submit"]').addClass('btn-disable')
            }
        })
    }

    if ($(window).width() > 991) {
        globalNav3dInit()
    }

    function requestFormInit() {
        const successPopupStatus = (isSuccess) => {
            if (isSuccess) {
                $('.popup-wrap .popup-inner').addClass('hidden');
                $('.popup-wrap .popup-inner-succ').removeClass('hidden');
            }
            else {
                $('.popup-wrap .popup-inner-succ').addClass('hidden');
                $('.popup-wrap .popup-inner').removeClass('hidden');
            }
        }
        $('.popup-wrap .popup-succ-btn-wrap').on('click', function (e) {
            $('.popup-wrap').removeClass('active');
            successPopupStatus(false);
        })
        formHandler('#request-offering', {
            onSuccess: () => successPopupStatus(true)
        })
    }
    requestFormInit();

    function footerEmailSubscribe() {
        formHandler('#email-form');
        $('#email-form #Newsletter').val('Newsletter');
        $('#email-form').find('.input-error').css({
            'position': 'absolute',
            'left': 0,
            'top': 'auto',
            'bottom': rem(-15)
        });
    }
    footerEmailSubscribe();

    function inputRadioInteract(formName) {
        let accreditedInput = $(`${formName} [data-input-hidden="accredited"]`);
        accreditedInput.val($(`${formName} .radio-input-item input[checked]`).parent().find('.radio-input-txt').text())
        $(`${formName} .radio-input-item`).on('change', function(e) {
            $(`${formName} .radio-input-item`).removeClass('active')
            $(this).addClass('active');
            accreditedInput.val($(this).find('.radio-input-txt').text())
            console.log(accreditedInput.val())
        })

        if ($(window).width() > 991) {
            $(`${formName} .radio-title-wrap`).on('click', (e) => {
                e.preventDefault()
            })
            $(`${formName} .radio-title-wrap`).on('mouseenter', (e) => {
                e.preventDefault();
                $(`${formName} .invest-req-tooltip-global`).addClass('active')
            })
            $(`${formName} .radio-title-wrap`).on('mouseleave', (e) => {
                e.preventDefault();
                $(`${formName} .invest-req-tooltip-global`).removeClass('active')
            })
        } else {
            $(`${formName} .radio-title-wrap`).on('click', (e) => {
                e.preventDefault();
                if ($(`${formName} .invest-req-tooltip-global`).hasClass('active')) {
                    $(`${formName} .invest-req-tooltip-global`).removeClass('active')
                } else {
                    $(`${formName} .invest-req-tooltip-global`).addClass('active')
                }
            })
        }
    }

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
                    if ($(window).width() > 991 && isTouchDevice()) {
                        gsap.set('.home-hero-barrel-wrap', {autoAlpha: 1})
                        $('.home-hero-barrel-canvas-wrap').remove();
                        homeHero3dTl
                        .to('.home-hero-barrel-wrap', {yPercent: 100, ease: 'none', delay: 0.25})

                    } else {
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
                if (!isTouchDevice()) {
                    let homeIntroTopOffset = ($(window).height() - $('.home-intro-title-wrap').height()) / 2;
                    $('.home-intro-title-wrap').css('top',`${homeIntroTopOffset}px`)
                }
                let homeDocOffsetTop = ($(window).height() - $('.home-doc-title-stick').height()) / 2;
                $('.home-doc-title-stick').css('top',`${homeDocOffsetTop}px`)
            }
            homeSetup()

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
                if (!isTouchDevice()) {
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
                    .from(homeIntroTitle.chars, {color: '#212121', duration: .1, stagger: 0.02, ease: 'power1.out'}, '0')
                }

                if (!isTouchDevice()) {
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
                } else {
                    $('.home-intro-title-stick-wrap').css('height','auto')
                }

                let homeIntroTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-intro-bg-wrap',
                        start: 'top top',
                        endTrigger: '.sc-home-intro',
                        end: 'bottom+=5% bottom+=100%',
                        scrub: true,
                    }
                })
                if (!isTouchDevice()) {
                    homeIntroTl
                    .from('.home-intro-bg-stick', {yPercent: 85, duration: 10, ease: 'none'})
                    .to('.home-intro-bg-stick .img-basic', {filter: 'blur(7px)', autoAlpha: 0, duration: 4}, '>=-4')
                } else {
                    homeIntroTl
                    .to('.home-intro-bg-stick .img-basic', {opacity: 0, duration: 10, ease: 'none'})
                }

                if ($(window).width() > 991 && isTouchDevice()) {
                    $('.mod-thumb-vid').css('display','none')
                    $('.mod-thumb').css('display','flex')
                }
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
                        if (!isTouchDevice()) {
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
                        } else {
                            $('.home-vid-ic-wrap:not(.mod-show)').remove()
                        }

                    }

                    let pathElement = $('.home-intro-vid-stick-wrap').offset().top + $('.home-intro-vid-stick-wrap').height()
                    $('.home-intro-vid').on('click', function(e) {
                        e.preventDefault()
                        console.log('click play video')
                        if ($(window).width() > 991) {
                            let scrollVal = pathElement - $(window).height() * .88;
                            if ($(window).width() > 991) {
                                lenis.stop();
                            }
                            lenis.scrollTo(scrollVal, {
                                duration: 1.2,
                                lock: true,
                                force: true
                            })

                            $(this).css('pointer-events','none')
                            setTimeout(() => {
                                $(this).css('pointer-events','auto')
                            }, 1200);
                            startVideo({video: '#vidHomeMain', delay: 1.2});
                        } else {
                            startVideo({video: '#vidHomeMain', delay: 0})
                        }

                    })
                    $('.home-vid-ic-close').on('click', function(e) {
                        e.preventDefault();
                        stopVideo({video: '#vidHomeMain'})
                    })
                    function startVideo({video, delay = 1.2}) {
                        if (video) {
                            let el = $(video).get(0);
                            el.play()
                        }

                        setTimeout(() => {
                            $('.home-vid-embed-main').addClass('active')
                        }, delay * 500);
                        $('.home-vid-ic-close').addClass('active')
                        $('.header-wrap').addClass('hidden')
                        $('.header-bg').addClass('hidden')
                    }
                    function stopVideo({video}) {
                        let el = $(video).get(0);
                        el.pause();

                        if ($(window).width() > 991) {
                            lenis.start();
                        }
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
                if (!isTouchDevice()) {
                    homePreTl
                    .fromTo('.home-pre-title:nth-child(1)', {autoAlpha: 0}, {autoAlpha: 1, duration: 2.5})
                    .from('.pre-invest-x.right .pre-invest-x-inner', {yPercent: -100, duration: 2.5, ease: Power1.easeOut}, '<=0')
                    .to('.home-pre-title:nth-child(1)', {autoAlpha: 0, duration: 2.5})
                    .fromTo('.home-pre-title:nth-child(2)', {autoAlpha: 0}, {autoAlpha: 1, duration: 2.5})
                    .from('.pre-invest-x.left .pre-invest-x-inner', {yPercent: -100, duration: 2.5, ease: Power1.easeOut}, '<=0')
                    .to('.home-pre-title:nth-child(2)', {autoAlpha: 0, duration: 2.5})
                } else {
                    homePreTl
                    .fromTo('.home-pre-title:nth-child(1)', {autoAlpha: 0}, {autoAlpha: 1, duration: 2.5})
                    .to('.home-pre-title:nth-child(1)', {autoAlpha: 0, duration: 2.5})
                    .fromTo('.home-pre-title:nth-child(2)', {autoAlpha: 0}, {autoAlpha: 1, duration: 2.5})
                    .to('.home-pre-title:nth-child(2)', {autoAlpha: 0, duration: 2.5})
                }
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
                if ($(window).width() > 991 && isTouchDevice()) {
                    gsap.set('.home-invest-sub', {color: '#ffffff'})
                    $('.home-invest-marquee-stick-wrap').css({
                        'display': 'flex',
                        'justify-content': 'center',
                        'align-items': 'center'
                    })

                    let rightClone = $('.home-invest-marquee-txt-wrap.from-right .home-invest-marquee-txt').clone();
                    $('.home-invest-marquee-txt-wrap.from-right').prepend(rightClone.clone())
                    $('.home-invest-marquee-txt-wrap.from-right .home-invest-marquee-txt').addClass('anim-marquee-right')

                    let leftClone = $('.home-invest-marquee-txt-wrap.from-left .home-invest-marquee-txt').clone();
                    $('.home-invest-marquee-txt-wrap.from-left').prepend(leftClone.clone())
                    $('.home-invest-marquee-txt-wrap.from-left .home-invest-marquee-txt').addClass('anim-marquee-left')



                } else {
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

                    let homeInvestTitleNoAnimTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-invest-marquee-stick-wrap',
                            start: 'top bottom',
                            end: `bottom+=${$(window).height()} bottom`,
                            scrub: true,
                        }
                    })
                    let distance = $('.home-invest-marquee-stick-wrap').height() - $('.home-invest-title-noanim').height();
                    if (viewport.width > 767) {
                        homeInvestTitleNoAnimTl.to('.home-invest-title-noanim', { y: distance, duration: 5, ease: 'none' }, '0')
                    }
                    homeInvestTitleNoAnimTl
                    .to('.pre-invest-bg-wrap.bg-x .pre-invest-bg:not(.mod-home-cta-mb)', {autoAlpha: 0, yPercent: -15, duration: 5, ease: 'power1.in'}, '0')

                    if (viewport.width > 767 && !isTouchDevice()) {
                        const homeInvestTitleNoAnim = new SplitText('.home-invest-title-noanim-inner', {type: 'lines, chars'});
                        const tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: '.home-invest-marquee-stick-wrap',
                                start: `top bottom-=${($(window).height() * 0.25)}`,
                                end: `bottom top+=${($(window).height() * 0.25)}`,
                                scrub: true,
                            }
                        })
                        tl.from(homeInvestTitleNoAnim.chars, {color: 'rgb(157, 157, 157)', duration: .5, stagger: 0.4 }, '0')
                    }
                }
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
                if (!isTouchDevice()) {
                    homeInvestStepTl
                    .from('.home-pre-invest-wrap .pre-invest-slash.right .pre-invest-slash-inner', {yPercent: -100, duration: 2.5}, '<=0')
                    .from('.home-pre-invest-wrap .pre-invest-slash.left .pre-invest-slash-inner', {yPercent: 100, duration: 2.5}, '<=1.5')
                    if (viewport.width > 767) {
                        homeInvestStepTl
                            .from('.home-invest-step-item-inner .home-invest-item-step-txt', { autoAlpha: 0, xPercent: 100, duration: 2.5, stagger: 1, ease: "power1.out" }, '0')
                            .from('.home-invest-step-item-inner .home-invest-step-number-wrap', {autoAlpha: 0, xPercent: 220, duration: 2.5, stagger: 1, ease: "power1.out"}, '0')
                            .from('.home-invest-step-item-inner .home-invest-step-title', {autoAlpha: 0, xPercent: 100, duration: 2.5, stagger: 1, ease: "power1.out"}, '<=0')
                            .from('.home-invest-step-item-inner .home-invest-step-para', {autoAlpha: 0, xPercent: 100, duration: 2.5, stagger: 1, ease: "power1.out"}, '<=.2')
                    }
                } else {
                    gsap.set('.home-pre-invest-wrap .pre-invest-slash.right .pre-invest-slash-inner', {autoAlpha: 0})
                    gsap.set('.home-pre-invest-wrap .pre-invest-slash.left .pre-invest-slash-inner', {autoAlpha: 0})
                0}
                homeInvestStepTl.fromTo('.header-bg .header-bg-top, .header-bg .header-bg-bot ', {autoAlpha: 1}, {autoAlpha: 0, duration: 5.5}, '0')

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
                if (!isTouchDevice()) {
                    homeDiscorTl
                    .to('.sc-home-discor .home-discor-bg-white', {y: `-25vh`, duration: 2.5, ease: 'power1.out'}, '0')
                } else {
                    gsap.set('.sc-home-discor .home-discor-bg-white', {y: `-25vh`}, '0')
                }

                if ($(window).width() > 991 && isTouchDevice()) {

                } else {
                    gsap.set('.home-discor-item', {perspective: '40rem', perspectiveOrigin: 'top'})
                    gsap.set('.home-discor-item-inner-wrap', {transformOrigin: 'top'})
                    const homeDiscorTitleTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.sc-home-discor .home-discor-main-wrap',
                            start: 'top top+=75%',
                            end: 'bottom top+=75%',
                            scrub: viewportBreak({
                                desktop: true,
                                mobile: false
                            }),
                        }
                    })
                    homeDiscorTitleTl
                    .from('.home-discor-item-inner-wrap', {
                        rotationX: -45,
                        autoAlpha: 0,
                        duration: viewportBreak({ desktop: 2.5, mobile: .8 }),
                        stagger: viewportBreak({ desktop: 2, mobile: .3 })
                    })
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


                if ($(window).width() > 991 && isTouchDevice()) {

                } else {
                    let allSelectImg = $('.home-discor-bg-item.mod-info')
                    allSelectImg.each((index, el) => {
                        gsap.set(el.querySelector('.home-discor-bg-item-img-inner-wrap'), {clipPath: 'inset(20%)'})
                        gsap.set(el.querySelector('.home-discor-bg-item-img-inner-wrap img'), {scale: 1.4, autoAlpha: 0})
                        const howSelectItemImgTl = gsap.timeline({
                            scrollTrigger: {
                                trigger: el,
                                start: 'top bottom-=28%',
                            },
                            onComplete() {
                                el.classList.add('on-hover');
                                el.querySelector('img').classList.add('on-hover')
                            }
                        })
                        howSelectItemImgTl
                        .to(el.querySelector('.home-discor-bg-item-img-inner-wrap'), { clipPath: 'inset(0%)', duration: 1.2, ease: 'expo.out'})
                        .to(el.querySelector('.home-discor-bg-item-img-inner-wrap img'), { scale: 1, duration: 1.2, autoAlpha: 1, ease: 'expo.out', clearProps: 'all'}, '0')
                    })
                }
                if ($(window).width() > 991) {
                    $('.home-discor-item-toggle').on('click', function(e) {
                        e.preventDefault();
                        if (!$(this).hasClass('on-expand')) {
                            $(this).closest('.home-discor-data-content').find('[data-discor="body"]').addClass('expand')
                            $(this).text('Collapse')
                            $(this).addClass('on-expand')
                        } else {
                            $(this).closest('.home-discor-data-content').find('[data-discor="body"]').removeClass('expand')
                            $(this).text('Learn more')
                            $(this).removeClass('on-expand')
                        }
                    })
                }

                // $('.home-discor-bg-item.mod-info').on('pointerenter', function(e) {
                //     $('.cursor-inner').addClass('on-discor')
                // })
                // $('.home-discor-bg-item.mod-info').on('pointerleave', function(e) {
                //     $('.cursor-inner').removeClass('on-discor')
                // })

                // lenis.on('scroll', function(inst) {
                //     for (let x = 0; x < $('.home-discor-bg-item.mod-info .home-discor-bg-item-img-inner').length; x++) {
                //         let offset = $('.home-discor-bg-item.mod-info .home-discor-bg-item-img-inner').eq(x).get(0).getBoundingClientRect().top;
                //         if (offset < $(window).height() && offset > 0) {
                //             console.log(x)
                //             $('.home-discor-bg-item.mod-info .home-discor-bg-item-img-inner').parent().removeClass('inview')
                //             $('.home-discor-bg-item.mod-info .home-discor-bg-item-img-inner').eq(x).parent().addClass('inview')
                //         }
                //     }
                // })
            }
            homeDiscorInit();
            function homeDiscorBgInit() {
                if ($(window).width() > 991) {
                    let heightVal;
                    if ($(window).width() > 1440) {
                        heightVal = '48.43vw';
                    } else {
                        heightVal = '53.43vw';
                    }
                    gsap.set('.home-discor-bg-item.mod-invest', {marginLeft: '-19.1145833333vw', marginRight: '-19.1145833333vw', height: heightVal})

                    if (!isTouchDevice()) {
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
                            .to('.home-discor-bg-item.mod-invest', {marginLeft: '-19.1145833333vw', marginRight: '-19.1145833333vw', height: heightVal, duration: 2.5, ease: 'power1.inout'})
                            .to('.home-discor-bg-item.mod-invest .home-discor-bg-item-inner', {marginLeft: '0', marginRight: '0', marginTop: '0', duration: 2.5, ease: 'power1.inout'},'0')
                            .to('.home-discor-bg-item.mod-invest .home-discor-invest-grad', {autoAlpha: 1, duration: 2.5}, '0')
                            .to('.home-discor-hover-item.mod-invest', {yPercent: -200, autoAlpha: 0, pointerEvents: 'none', duration: 2.5}, '0')
                            //-19.1145833333vw
                        }, 100);
                    } else {
                        setTimeout(() => {
                            gsap.set('.home-discor-bg-item.mod-invest', {clearProps:'all'})
                            gsap.set('.home-discor-bg-item.mod-invest', {marginLeft: '-19.1145833333vw', marginRight: '-19.1145833333vw', height: heightVal})
                            gsap.set('.home-discor-bg-item.mod-invest .home-discor-bg-item-inner', {marginLeft: '0', marginRight: '0', marginTop: '0'})
                            gsap.set('.home-discor-bg-item.mod-invest .home-discor-invest-grad', {autoAlpha: 1})
                            gsap.set('.home-discor-hover-item.mod-invest', {yPercent: -200, autoAlpha: 0, pointerEvents: 'none'})
                            //-19.1145833333vw
                        }, 100);
                    }


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
                if ($(window).width() > 991 && isTouchDevice()) {
                    gsap.set('.home-doc-title', {color: '#ffffff'})
                } else {
                    const homeDocTitle = new SplitText('.home-doc-title', { type: 'lines, chars'});
                    const homeDocTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.sc-home-doc',
                            start: `top top+=${viewportBreak({ desktop: 25, mobile: 75 })}%`,
                            endTrigger: `${viewportBreak({ desktop: '.sc-home-doc', mobile: '.home-doc-title' })}`,
                            end: `bottom ${viewportBreak({ desktop: 'bottom-=25%', mobile: 'top+=38%' })}`,
                            scrub: .8,
                        }
                    })
                    homeDocTl
                    .to(homeDocTitle.chars, {color: '#ffffff', duration: .1, stagger: 0.02, ease: Power1.easeOut}, '0')
                }

                if ($(window).width() > 991 && isTouchDevice()) {
                    gsap.set('.home-doc-prog-wrap .pre-invest-slash.right .pre-invest-slash-inner', {autoAlpha: 0})
                    gsap.set('.home-doc-prog-wrap .pre-invest-slash.left .pre-invest-slash-inner', {autoAlpha: 0})
                } else {
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
                }

                if (!isTouchDevice()) {
                    const homeDocBookTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.home-doc-book-stick',
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: viewportBreak({ desktop: .6, mobile: false }),
                        }
                    })
                    homeDocBookTl
                        .fromTo('.home-doc-book-stick img',
                            { yPercent: 10, xPercent: -10 },
                            {   yPercent: viewportBreak({ desktop: -10, mobile: -5 }),
                                xPercent: viewportBreak({ desktop: 0, mobile: -5 }),
                                duration: 2.5, ease: 'none'
                            })
                }

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
                if ($(window).width() > 991 && isTouchDevice()) {
                    let rightClone = $('.home-prog-marquee-txt-wrap .home-prog-marquee-txt').clone();
                    $('.home-prog-marquee-txt-wrap').prepend(rightClone.clone())
                    $('.home-prog-marquee-txt-wrap .home-prog-marquee-txt').addClass('anim-marquee-right')
                } else {
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
                }

                const homeProgContentTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-prog-main-stick',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    }
                })
                if (viewport.width > 767 && !isTouchDevice()) {
                    homeProgContentTl
                        .fromTo('.home-prog-img-wrap', { y: '-25vh' }, { y: '25vh', duration: 2.5, ease: 'power1.inout' })
                        .from('.home-prog-main', {y: '25vh', duration: 2.5}, '0')
                }

                if (viewport.width > 767 && isTouchDevice()) {

                } else {
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
                            scrub: viewportBreak({
                                desktop: true,
                                mobile: false
                            })
                        }
                    })
                    homeProgListTl
                        .from('.home-prog-item-wrap', {
                            rotationX: -45,
                            autoAlpha: 0,
                            duration: viewportBreak({ desktop: 2.5, mobile: .8 }),
                            stagger: viewportBreak({ desktop: 2, mobile: .3 })
                        }, '0')
                    .from('.home-prog-main .btn-md.mod-outline', {yPercent:100, autoAlpha: 0, duration: 2.5}, '>=-2')
                }

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
                if (!isTouchDevice()) {
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
                } else {
                    $('.sc-home-cta').css({
                        'height': '200vh',
                        'margin-top': '0',
                        'margin-bottom': '-100vh'
                    })
                }
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
                homeHeroImgTl
                .fromTo('.how-hero-img-wrap-inner img', {'object-position': '50% 0%'}, {'object-position': '50% 100%', ease: 'linear'})
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
                console.log(formType == 'individual')
                if (formType == 'individual' || formType == 'trust' || formType == 'joint' || formType == 'corporate') {
                    $('[popup-content="signup"]').removeClass('active')
                    setupForm(formType)
                } else {
                    console.log('empty')
                    $('[popup-content="signup"]').addClass('active')
                    $('[data-signup]').attr('data-barba-prevent','self')
                    $('[data-signup]').on('click', function(e) {
                        e.preventDefault();
                        let formType = $(this).attr('data-signup');
                        setupForm(formType)
                        history.replaceState({}, '', `${window.location.pathname + '?type=' + formType}`)
                        $(this).closest('[popup-content]').removeClass('active')
                    })
                }
            }
            getFormType()

            function setupForm(formType) {
                setupStepNav(formType)
                setupStepContent(formType)
                $('.hidden-input input').val(formType)
                console.log($('.hidden-input input').val())
                $('[data-input-url]').val(window.location.href);
                inputInteractionInit("#openAccountForm");
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

                function stepValidate(form) {
                    let formData = new FormData();
                    let success = false;

                    let activeDiv = $('.account-form-person').eq(activeStep);
                    activeDiv.find('input.w-input').each(function() {
                        formData.append(this.name, this.value);
                    });

                    const stepFormsObj = mapFormToObject(form, formData);
                    const rules = mapObjectFormToValidate(form, stepFormsObj);
                    const { errorObj, isValidated } = validateForm({
                        formsObj: stepFormsObj,
                        rules: rules
                    });
                    if (isValidated) {
                        success = true;
                        return { success };
                    }
                    else {
                        success = false;
                        return { errorObj, success };
                    }
                }

                function submitLastStep(form) {
                    let newWin = window.open(buildUrl(form), '_blank', 'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000,top=10000,width=10,height=10,visible=none', '');
                    newWin.blur();
                    newWin.close();
                    $('.signup-success-wrap').addClass('active');
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
                    const form = $('#openAccountForm').get(0);
                    const { errorObj: errors, success } = stepValidate(form);

                    if (success) {
                        activeStep +=1;
                        currentStep += 1;
                        if (activeStep == stepAmount.length) {
                            return;
                        } else {
                            activeThisStep(activeStep)
                        }
                        errorValidation.reset(form);
                    }
                    else {
                        errorValidation.active(form, errors);
                    }
                })

                $('[data-signup-btn="submit"]').on('click', function(e) {
                    e.preventDefault();
                    submitLastStep($('#openAccountForm'));
                })
            }
        },
        beforeLeave() {
            console.log('leave openAccount')
            $('[data-signup]').removeAttr('data-barba-prevent')
            $('[data-signup]').off('click')
        }
    }
    SCRIPT.contactUsScript = {
        namespace: 'contactUs',
        afterEnter() {
            console.log('enter contactUs')
            $('.contact-add-item-wrap').on('click', function(e) {
                e.preventDefault();
                console.log("click 👉️", $(this))
                let country = $(this).attr('data-map-link');
                $('.contact-add-item-wrap').removeClass('active')
                $(this).addClass('active');

                $('[data-map]').removeClass('active');
                $(`[data-map="${country}"]`).addClass('active')
            })

            function contactFormInit() {
                formHandler('#contactUsForm', {
                    onSuccess: (success) => popupSuccessGeneration(success)
                });
            }
            contactFormInit();
        },
        beforeLeave() {
            console.log('leave contactUs')
        }
    }
    SCRIPT.investmentGuideScript = {
        namespace: 'investmentGuide',
        afterEnter() {
            console.log('enter investmentGuide')

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
                        scrub: true,
                    }
                })
                investFormBgTl
                .fromTo('.invest-form-bg-wrap img', {'object-position': '50% 0%'}, {'object-position': '50% 100%', ease: 'linear'})

                formHandler('#investmentGuideForm', {
                    onSuccess: (success) => popupSuccessGeneration(success)
                });
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

            $('[data-input-url]').val(window.location.href)
            inputInteractionInit('#productDtlForm')
            inputRadioInteract('#productDtlForm')

            $('.nav-link, .home-footer-link').removeClass('active')
            let productType = $(`[data-title]`).attr('data-title');
            console.log(productType)
            $(`.nav-link.w--current`).addClass('active')
            $(`.home-footer-link.w--current`).addClass('active')

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

            function prodFormInit() {
                formHandler("#productDtlForm", {
                    onSuccess: (success) => popupSuccessGeneration(success)
                });
            }
            prodFormInit();
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
            inputInteractionInit('[data-name="Blog Srch"]');
            blogSrchInit()
            //checkUrl()

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

                if ($(window).width() < 768) {
                    $('.blog-tab-mb-toggle').on('click', function(e) {
                        e.preventDefault();
                        if ($(this).hasClass('open')) {
                            $(this).removeClass('open');
                            $('.blog-tab-links-inner-form').removeClass('active')
                        } else {
                            $(this).addClass('open');
                            $('.blog-tab-links-inner-form').addClass('active')
                        }
                    })
                }
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
            inputInteractionInit('[data-name="Blog Srch"]');
            blogSrchInit()

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
            partMarqueeInit();

            function partnerFormInit() {
                formHandler('#partnerForm', {
                    onSuccess: (success) => popupSuccessGeneration(success)
                });
            }
            partnerFormInit();

        },
        beforeLeave() {
            console.log('leave partner program')
        }
    }
    SCRIPT.aboutScript = {
        namespace: 'about',
        afterEnter() {
            console.log('enter about us page')
            function aboutHero3dInit() {
                console.log('about hero 3d init')

                let cameraOpt = {
                    zPosition: 14.8,
                }
                let barrelStart = {
                    zPosition: 0,
                    yPosition: 0,
                    xRotation: 0,
                    yRotation: 0,
                }
                let lightIntensity = {
                    env: 1,
                    rim: {
                        lr: .6,
                        tb: .6,
                        bot: .6
                    }
                };

                const scene = new THREE.Scene()

                rendererAboutHero.domElement.id = 'about3d';

                $('.about-3d-wrap').append(rendererAboutHero.domElement);

                cameraAboutHero.position.z = cameraOpt.zPosition;

                let rimLeft = new THREE.DirectionalLight("#FBC30F", lightIntensity.rim.lr);
                let rimRight = new THREE.DirectionalLight("#FBC30F", lightIntensity.rim.lr);
                let rimTop = new THREE.DirectionalLight("#ffffff", lightIntensity.rim.tb);
                let rimBottom = new THREE.DirectionalLight("#FBC30F", lightIntensity.rim.bot);

                rimLeft.lookAt(0,0,0);
                rimLeft.position.set(5,0,-10);
                rimLeft.scale.set(2,2,2)
                rimLeft.rotation.z = -Math.PI / 2;

                rimRight.lookAt(0,0,0);
                rimRight.position.set(-5,0,-10);
                rimRight.scale.set(2,2,2)
                rimRight.rotation.z = Math.PI / 2;

                rimTop.lookAt(0,0,0);
                rimTop.position.set(0,4,-12);
                rimTop.scale.set(2,2,2)
                rimTop.rotation.z = Math.PI / 2;

                rimBottom.lookAt(0,0,0);
                rimBottom.position.set(0,-6,-12);
                rimBottom.scale.set(2,2,2)
                rimBottom.rotation.z = Math.PI / 2;

                const environmentMap = enviromentMapLoad;

                let barrel;
                let outerGroup = new THREE.Group();
                let clock = new THREE.Clock();
                barrelAboutHero.then((gltf) => {
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
                    scene.add(rimBottom);
                    aboutHero3dAnim()
                })

                rendererAboutHero.setAnimationLoop(animate)
                function animate() {
                    if (!$('[data-barba-namespace="about"]').length) {
                        return;
                    }
                    if (barrel) {
                        barrel.rotation.y -= pi * 0.001;
                        barrel.rotation.z = Math.sin(clock.getElapsedTime() / 100)
                        barrel.rotation.x = Math.cos(clock.getElapsedTime() / 10)

                        if ($(window).width() > 991) {
                            outerGroup.position.x = lerp(outerGroup.position.x, - ((pointer.x / (viewport.width) - 0.5) * 2) * .4, 0.02)
                            outerGroup.position.y = lerp(outerGroup.position.y, ((pointer.y / (viewport.height) - 0.5) * 2) * .4, 0.02)
                        }
                    }
                    rendererAboutHero.render( scene, cameraAboutHero );
                }

                function aboutHero3dAnim() {
                    const aboutHero3dTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.sc-abt-hero',
                            start: `top top`,
                            end: `bottom top`,
                            scrub: .1,
                        }
                    })
                    aboutHero3dTl
                    .to(outerGroup.rotation, {y: Math.PI, ease: 'linear'})
                }
            }
            aboutHero3dInit();

            function abtHeroSetup() {
                let offsetTop = `${($(window).height() - $('.abt-hero-stick-inner').height()) / 2}px`;
                let abt3dMargin = $(window).width() - $('.container').width();

                if (viewport.width > 767) {
                    $('.abt-hero-title-wrap').css('padding-top', offsetTop)
                    $('.abt-hero-stick-inner').css('top', offsetTop)
                    $('.abt-hero-stick-inner').css('margin-top', offsetTop)
                    $('.about-3d-wrap').css('margin', `-${abt3dMargin}px`);
                }
                $(window).resize()
            }
            abtHeroSetup();
            function abtTimeSetup() {
                const allTimeZones = $('[data-time]')
                allTimeZones.each((index, el) => {
                    let zone = $(el).attr('data-time');
                    $(el).find('[data-time-txt]').text(dayjs(Date.now()).tz(zone).format('HH:mm:ss'))
                })
            }
            abtTimeSetup()

            function aboutHeroInit() {
                const abtHeroTitle = new SplitText('.abt-hero-title', {type: 'words'})
                const tlAbtHero = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-hero-title-wrap',
                        start: 'top top',
                        end: `bottom-=${viewportBreak({ desktop: 0, mobile: 50 })}% top+=${viewportBreak({ desktop: 40, mobile: 0 })}%`,
                        scrub: true,
                    }
                })
                tlAbtHero
                .from(abtHeroTitle.words.slice(1), {color: '#212121', duration: .1, stagger: .02, ease: 'power1.out'})
            }
            aboutHeroInit()

            function abtMainInit() {
                const abtMainItems = $('.abt-main-item-wrap');
                for (let x = 0; x < abtMainItems.length; x++) {
                    gsap.set(abtMainItems.eq(x).find('.abt-main-item-img-wrap'), {clipPath: 'inset(20%)'})
                    gsap.set(abtMainItems.eq(x).find('.abt-main-item-img-wrap img'), {scale: 1.4, autoAlpha: 0})

                    const tlAbtMainImg = gsap.timeline({
                        scrollTrigger: {
                            trigger: abtMainItems.eq(x),
                            start: 'top top+=60%',
                        }
                    })
                    tlAbtMainImg
                    .from(abtMainItems.eq(x).find('.part-help-img-grad'), {autoAlpha: 0, duration: 1, ease: 'expo.out'}, '0')
                    .to(abtMainItems.eq(x).find('.abt-main-item-img-wrap'), { clipPath: 'inset(0%)', duration: 1.4, ease: 'expo.out'},'0')
                    .to(abtMainItems.eq(x).find('.abt-main-item-img-wrap img'), { scale: 1, duration: 1.4, autoAlpha: 1, ease: 'expo.out', clearProps: 'all'}, '0')

                    const abtMainItemTitle = new SplitText(abtMainItems.eq(x).find('.abt-main-item-title'), {type: 'lines, words'})

                    const tlAbtMainTitle = gsap.timeline({
                        scrollTrigger: {
                            trigger: abtMainItems.eq(x).find('.abt-main-content-wrap'),
                            start: 'top bottom-=25%',
                            end: 'bottom top+=50%',
                            scrub: true,
                        }
                    })
                    tlAbtMainTitle
                    .from(abtMainItemTitle.words, {color: '#212121', duration: .1, stagger: .02, ease: 'power1.out'})

                    const abtMainItemBody = new SplitText(abtMainItems.eq(x).find('.abt-main-item-sub'), {type: 'lines, words'})
                    gsap.set(abtMainItemBody.lines, {'overflow': 'hidden'})

                    const tlAbtMainItemBody = gsap.timeline({
                        scrollTrigger: {
                            trigger: abtMainItems.eq(x).find('.abt-main-content-wrap'),
                            start: 'top top+=60%',
                        }
                    })
                    tlAbtMainItemBody
                    .from(abtMainItemBody.words, {autoAlpha: 0, yPercent: 100, duration: .8, stagger: .003})
                }
            }
            abtMainInit()

            function abtWhySetup() {
                $('.abt-why-item-wrap').on('pointerover', function(e) {
                    gsap.to('.abt-why-img-inner', {yPercent: -100 * $(this).index(), duration: .6, ease: 'sine.out', overwrite: true})
                })
                let tlAbtWhyMain = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-why-list-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                })
                tlAbtWhyMain
                .to('.abt-why-img-inner-wrap', {yPercent: 100, ease: 'none'})

                const abtWhyLabel = new SplitText('.abt-why-title-wrap .abt-why-label', {type: 'lines, words'})
                const abtWhyTitle = new SplitText('.abt-why-title-wrap .h-size72', {type: 'lines, words'})
                gsap.set([abtWhyLabel.lines, abtWhyTitle.lines], {'overflow': 'hidden'})

                const tlAbtWhyTitle = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-why-title-wrap',
                        start: 'top top+=60%',
                    }
                })
                tlAbtWhyTitle
                .from(abtWhyLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1 }, '0')
                .from(abtWhyTitle.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .03 }, '<= .25')

                gsap.set('.abt-why-list-wrap', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.abt-why-list-item-inner', {transformOrigin: 'top'})
                const tlAbtTeamMain = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-why-list-wrap',
                        start: 'top top+=70%',
                        end: 'bottom top+=70%',
                        scrub: true
                    }
                })
                tlAbtTeamMain
                .from('.abt-why-list-item-inner', {rotationX: -45, autoAlpha: 0, duration: 2.5, stagger: 1}, '0')

            }
            abtWhySetup()

            function abtTeamInit() {
                const abtTeamLabel = new SplitText('.abt-team-title-wrap .abt-team-label', {type: 'lines, words'})
                const abtTeamTitle = new SplitText('.abt-team-title-wrap .abt-team-title', {type: 'lines, words'})
                gsap.set([abtTeamLabel.lines, abtTeamTitle.lines], {'overflow': 'hidden'})

                const tlAbtTeamTitle = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-team-title-wrap',
                        start: 'top top+=60%',
                    }
                })
                tlAbtTeamTitle
                .from(abtTeamLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .02 }, '0')
                .from(abtTeamTitle.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .03 }, '<= .25')

                if ($(window).width() > 991) {
                    const abtTeamSub = new SplitText('.abt-team-cms-wrap .abt-team-sub:not(.w-condition-invisible)', {type: 'lines, words'})
                    gsap.set(abtTeamSub.lines, {'overflow':'hidden'})
                    const tlAbtTeamSub = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.abt-team-cms-wrap .abt-team-sub:not(.w-condition-invisible)',
                            start: 'top top+=60%',
                        }
                    })
                    tlAbtTeamSub
                    .from(abtTeamSub.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .003 }, '<= .25')
                } else {
                    const abtTeamSub = new SplitText('.abt-team-sub.hidden-dk', {type: 'lines, words'})
                    gsap.set(abtTeamSub.lines, {'overflow':'hidden'})
                    const tlAbtTeamSub = gsap.timeline({
                        scrollTrigger: {
                            trigger: '.abt-team-sub.hidden-dk',
                            start: 'top top+=60%',
                        }
                    })
                    tlAbtTeamSub
                    .from(abtTeamSub.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .003 }, '<= .25')
                }

                const allAbtTeamItems = $('.abt-team-cms-item')
                for (let x = 0; x < allAbtTeamItems.length; x++) {
                    gsap.set(allAbtTeamItems.eq(x).find('.abt-team-item-img-wrap'), {clipPath: 'inset(20%)'})
                    gsap.set(allAbtTeamItems.eq(x).find('.abt-team-item-img-wrap img'), {scale: 1.4})

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: allAbtTeamItems.eq(x),
                            start: 'top top+=60%',
                        },
                        delay: (x == 2 || x == 4) ? '0.2' : '0',
                    })
                    tl
                    .from(allAbtTeamItems.eq(x).find('.abt-team-item-wrap'), {autoAlpha: 0, duration: .4, ease: 'linear'}, '0')
                    .to(allAbtTeamItems.eq(x).find('.abt-team-item-img-wrap'), { clipPath: 'inset(0%)', duration: 1, ease: 'expo.out', clearProps: 'background-color'},'0')
                    .to(allAbtTeamItems.eq(x).find('.abt-team-item-img-wrap img'), { scale: 1, duration: 1, ease: 'expo.out', clearProps: 'all'}, '0')
                    .from(allAbtTeamItems.eq(x).find('.abt-team-item-info-name'), {autoAlpha: 0, yPercent: 100, duration: .8}, '.1')
                    .from(allAbtTeamItems.eq(x).find('.abt-team-item-info-job'), {autoAlpha: 0, yPercent: 100, duration: .8}, '.2')
                }


            }
            abtTeamInit()

            function abtTimeInit() {
                const abtTimeLabel = new SplitText('.abt-loca-label', {type: 'lines, words'});

                gsap.set(abtTimeLabel.lines, {'overflow': 'hidden'})

                const tlAbtTimeLabel = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.abt-loca-label',
                        start: 'top top+=60%',
                    }
                })
                tlAbtTimeLabel
                .from(abtTimeLabel.words, {autoAlpha: 0, yPercent: 100, duration: 1, stagger: .03 });

                const allAbtTimeItems = $('.abt-loca-item-wrap');
                for (let x = 0; x < allAbtTimeItems.length; x++) {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: allAbtTimeItems.eq(x),
                            start: 'top top+=65%',
                        }
                    })
                    tl
                    .from(allAbtTimeItems.eq(x).find('.abt-loca-country'), {autoAlpha: 0, yPercent: 100, duration: .6}, '0')
                    .from(allAbtTimeItems.eq(x).find('.abt-loca-place'), {autoAlpha: 0, yPercent: 50, duration: .8}, '<=.1')
                    .from(allAbtTimeItems.eq(x).find('.abt-loca-time'), {autoAlpha: 0, yPercent: 100, duration: .6}, '<=.2')
                }

            }
            abtTimeInit()

        },
        beforeLeave() {
            console.log('leave about us page')
        }
    }
    SCRIPT.newsScript = {
        namespace: 'news',
        afterEnter() {
            console.log('enter news page')
            initBlogFs()
            function newsHeroInit() {
                const newsHeroTitle = new SplitText('.news-main-title', {type: 'lines, words'})
                const newsHeroSub = new SplitText('.news-main-sub', {type: 'lines, words'})

                gsap.set([
                    newsHeroTitle.lines,
                    newsHeroSub.lines], { overflow: 'hidden' })

                const tlNewsHero = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlNewsHero
                .from(newsHeroTitle.words, { autoAlpha: 0, yPercent: 100, duration: 1 }, '0')
                .from(newsHeroSub.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .03 }, '<= .25')
            }
            newsHeroInit();
        },
        beforeLeave() {
            console.log('leave news page')
            resetBlogFs()
        }
    }
    SCRIPT.distilleryScript = {
        namespace: 'distillery',
        afterEnter() {
            console.log('enter Distillery Detail page')
            function distHeroInit() {
                const distHeroTitle = new SplitText('.dist-hero-title', {type: 'lines, words'})
                const distHeroSub = new SplitText('.dist-hero-sub', {type: 'lines, words'})

                gsap.set([
                    distHeroTitle.lines,
                    distHeroSub.lines], { overflow: 'hidden' })

                const tlDistHero = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlDistHero
                .from(distHeroTitle.words, { autoAlpha: 0, yPercent: 100, duration: 1 }, '0')
                .from(distHeroSub.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .03 }, '<= .25')
            }
            distHeroInit()

            function distMainInit() {
                const allDistItems = $('.dist-main-cms-item');
                for (let x = 0; x < allDistItems.length; x++) {
                    const distItemTitle = new SplitText(allDistItems.eq(x).find('.dist-main-item-title'), {type: 'lines, words'})
                    const distItemSub = new SplitText(allDistItems.eq(x).find('.dist-main-item-sub'), {type: 'lines, words'})

                    gsap.set(allDistItems.eq(x).find('.dist-main-item-img-wrap'), {clipPath: 'inset(20%)', pointerEvents: 'none', opacity: 0})
                    gsap.set(allDistItems.eq(x).find('.dist-main-item-img-wrap img'), {scale: 1.4, autoAlpha: 0})

                    gsap.set([
                    distItemTitle.lines,
                    distItemSub.lines], { overflow: 'hidden' })

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: allDistItems.eq(x),
                            start: 'top top+=60%',
                        }
                    })
                    tl
                    .from(distItemTitle.words, {autoAlpha: 0, yPercent: 100, duration: .8}, '0')
                    .from(distItemSub.words, {autoAlpha: 0, yPercent: 100, duration: .4, stagger: .03}, '<=.25')
                    .from(allDistItems.eq(x).find('.mod-dist-main-btn'), {autoAlpha: 0, yPercent: 100, duration: .8}, '<=.25')
                    .to(allDistItems.eq(x).find('.dist-main-item-img-wrap'), { clipPath: 'inset(0%)', duration: 1.4, ease: 'expo.out', clearProps: 'pointer-events', opacity: 1},'0')
                    .to(allDistItems.eq(x).find('.dist-main-item-img-wrap img'), { scale: 1, duration: 1.4, autoAlpha: 1, ease: 'expo.out', clearProps: 'all'}, '0')
                }
            }
            distMainInit()
        },
        beforeLeave() {
            console.log('leave Distillery Detail page')
        }
    }
    SCRIPT.distilleryDtlScript = {
        namespace: 'distilleryDtl',
        afterEnter() {
            console.log('enter Distillery Detail page')
            //Hidden url input

            function distDtlContentSetup() {
                let itemTemp = $('.distdtl-key-item-wrap').clone();
                let allTxtItems = $('.distdtl-key-rictxt p');
                $('.distdtl-key-rictxt').html('')
                $('.distdtl-key-item-wrap').remove()
                for (let x = 0; x < allTxtItems.length; x++) {
                    let html = itemTemp.clone()
                    html.find('.invest-how-item-inner-txt').text(allTxtItems.eq(x).text())
                    html.find('.invest-how-item-inner-value').text(`0${x + 1}`)
                    $('.distdtl-key-rictxt').append(html)
                }

                if (!$('.distdtl-stas-vid-wrap').hasClass('.w-condition-invisible')) {
                    if ($(window).width() > 991) {
                        $('.distdtl-stas-vid-wrap').on('pointerenter',(e) => {
                            lenis.stop();
                        })
                        $('.distdtl-stas-vid-wrap').on('pointerleave',(e) => {
                            lenis.start();
                        })
                    }
                }

            }
            distDtlContentSetup()

            function distDtlHeroInit() {
                const distDtlHeroTitle = new SplitText('.distdtl-hero-title', {type: 'lines, words'})
                const distDtlHeroSub = new SplitText('.distdtl-hero-sub', {type: 'lines, words'})

                gsap.set([
                    distDtlHeroTitle.lines,
                    distDtlHeroSub.lines], { overflow: 'hidden' })

                const tlDistDtlHero = gsap.timeline({
                    delay: delayTimeAfterEnter,
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlDistDtlHero
                .from('.distdtl-hero-brcr > *', {autoAlpha: 0, yPercent: 100, duration: .8, stagger: .2}, '0')
                .from(distDtlHeroTitle.words, { autoAlpha: 0, yPercent: 100, duration: 1 }, '0')
                .from('.distdtl-hero-img-inner', {autoAlpha: 0, duration: 1}, '0')
                for (let x = 0; x < distDtlHeroSub.lines.length; x++) {
                    tlDistDtlHero.from($(distDtlHeroSub.lines[x]).find('div'), { autoAlpha: 0, yPercent: 100, duration: .3, stagger: .01 }, '<= .1')
                }
            }
            distDtlHeroInit()

            function disDtlHeroImgInit() {
                const distDtlHeroImgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.distdtl-hero-img-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                })
                distDtlHeroImgTl
                .fromTo('.distdtl-hero-img-wrap .img-basic', {'object-position': '50% 0%'}, {'object-position': '50% 100%', ease: 'linear'})
            }
            disDtlHeroImgInit()

            function distDtlProfInit() {
                const distDtlProfLabel = new SplitText('.sc-distdtl-prof .distdtl-prof-title-wrap .distdtl-prof-label', {type: 'lines, words'})
                const distDtlProfTitle = new SplitText('.sc-distdtl-prof .distdtl-prof-title-wrap .distdtl-prof-title', {type: 'lines, words'})
                const distDtlProfRtHead = new SplitText('.sc-distdtl-prof .distdtl-prof-sub-wrap h3', {type: 'lines, words'})
                const distDtlProfRtBody = new SplitText('.sc-distdtl-prof .distdtl-prof-sub-wrap p', {type: 'lines, words'})

                gsap.set([distDtlProfLabel.lines,distDtlProfTitle.lines, distDtlProfRtHead.lines, distDtlProfRtBody.lines], { overflow: 'hidden' })

                const tlDistDtlProf = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-distdtl-prof .container',
                        start: 'top top+=60%',
                    },
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlDistDtlProf
                .from(distDtlProfLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .04 }, '0')
                .from(distDtlProfTitle.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .04 }, '<= .1')
                .from(distDtlProfRtHead.words, { autoAlpha: 0, yPercent: 100, duration: .4, stagger: .02 }, '.1')
                for (let x = 0; x < $('.sc-distdtl-prof .distdtl-prof-sub-wrap p').length; x++ ) {
                    tlDistDtlProf.from($('.sc-distdtl-prof .distdtl-prof-sub-wrap p').eq(x).find('div'), { autoAlpha: 0, yPercent: 100, duration: .3, stagger: .01 }, `<=${.1 * (x + 1)} `)
                }

                const distDtlProfImgs = $('.sc-distdtl-prof .distdtl-prof-img-cms-item');
                for (let x = 0; x < distDtlProfImgs.length; x++) {
                    gsap.set(distDtlProfImgs.eq(x), {clipPath: 'inset(20%)'})
                    gsap.set(distDtlProfImgs.eq(x).find('img'), {scale: 1.4, autoAlpha: 0})

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: distDtlProfImgs.eq(x),
                            start: 'top top+=60%',
                        }
                    })
                    tl
                    .fromTo(distDtlProfImgs.eq(x).find('.dist-main-item-img-overlay'), {autoAlpha: 0}, {autoAlpha: 1, duration: 1, ease: 'expo.out'}, `${.1 * x}`)
                    .to(distDtlProfImgs.eq(x), { clipPath: 'inset(0%)', duration: 1.4, ease: 'expo.out'},`${.1 * x}`)
                    .to(distDtlProfImgs.eq(x).find('img'), { scale: 1, duration: 1.4, autoAlpha: 1, ease: 'expo.out', clearProps: 'all'}, `${.1 * x}`)
                }

            }
            distDtlProfInit();

            function distDtlKeyInit() {
                const distDtlKeyLabel = new SplitText('.sc-distdtl-key .distdtl-key-title-wrap .distdtl-prof-label', {type: 'lines, words'})
                const distDtlKeyTitle = new SplitText('.sc-distdtl-key .distdtl-key-title-wrap .distdtl-prof-title', {type: 'lines, words'})

                gsap.set([distDtlKeyLabel.lines,distDtlKeyTitle.lines], { overflow: 'hidden' })

                const tlDistDtlKey = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-distdtl-key .distdtl-key-title-wrap',
                        start: '.top top+=60%',
                    },
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlDistDtlKey
                .from(distDtlKeyLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .04 }, '0')
                .from(distDtlKeyTitle.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .04 }, '<= .1')

                gsap.set('.sc-distdtl-key .distdtl-key-rictxt', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.sc-distdtl-key .distdtl-key-item-wrap', {transformOrigin: 'top'})
                const tlDistDtlKeyList = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-distdtl-key .distdtl-key-sub-wrap',
                        start: 'top bottom-=25%',
                        end: 'bottom top+=65%',
                        scrub: true
                    }
                })
                tlDistDtlKeyList
                .from('.sc-distdtl-key .distdtl-key-item-wrap', {rotationX: -45, autoAlpha: 0, duration: 2.5, stagger: 1}, '0')

                gsap.set('.distdtl-key-img-wrap', {clipPath: 'inset(20%)', overflow: 'hidden'})
                gsap.set('.distdtl-key-img-wrap img', {scale: 1.4, autoAlpha: 0})

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.distdtl-key-img-wrap',
                        start: 'top top+=60%',
                    }
                })
                tl
                .to('.distdtl-key-img-wrap', { clipPath: 'inset(0%)', duration: 1.8, ease: 'expo.out'}, '0')
                .to('.distdtl-key-img-wrap img', { scale: 1, duration: 1.8, autoAlpha: 1, ease: 'expo.out', clearProps: 'all'},  '0')
            }
            distDtlKeyInit()

            function distDtlStasInit() {
                const distDtlStasLabel = new SplitText('.sc-distdtl-stas .distdtl-prof-title-wrap .distdtl-stas-label', {type: 'lines, words'})
                const distDtlStasTitle = new SplitText('.sc-distdtl-stas .distdtl-prof-title-wrap .distdtl-prof-title', {type: 'lines, words'})
                const distDtlStasRtBody = new SplitText('.sc-distdtl-stas .distdtl-stas-sub-wrap p', {type: 'lines, words'})
                gsap.set([distDtlStasLabel.lines, distDtlStasTitle.lines, distDtlStasRtBody.lines], { overflow: 'hidden' })

                const tlDistDtlStas = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-distdtl-stas .container',
                        start: 'top top+=60%',
                    },
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlDistDtlStas
                .from(distDtlStasLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .04 }, '0')
                .from(distDtlStasTitle.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .04 }, '<= .1')
                for (let x = 0; x < $('.sc-distdtl-stas .distdtl-stas-sub-wrap p').length; x++ ) {
                    tlDistDtlStas.from($('.sc-distdtl-stas .distdtl-stas-sub-wrap p').eq(x).find('div'), { autoAlpha: 0, yPercent: 100, duration: .3, stagger: .004 }, `<=${.1 * x} `)
                }

                gsap.set('.distdtl-stas-main', {perspective: '40rem', perspectiveOrigin: 'top'})
                gsap.set('.distdtl-stas-main .distdtl-stas-item-wrap', {transformOrigin: 'top'})

                const tlDistDtlStasList = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.distdtl-stas-main',
                        start: 'top top+=60%',
                    }
                })
                tlDistDtlStasList
                .from('.distdtl-stas-main .distdtl-stas-item-wrap', {rotationX: -45, autoAlpha: 0, duration: .6, stagger: .08}, '0')

            }
            distDtlStasInit()

            function distDtlFormInit() {
                formHandler('#distilleryDtlForm', {
                    onSuccess: (success) => popupSuccessGeneration(success)
                });
            }
            distDtlFormInit();
        },
        beforeLeave() {
            console.log('leave Distillery Detail page')
        }
    }
    SCRIPT.whiskyMadeScript = {
        namespace: 'whistkyMade',
        afterEnter() {
            console.log('enter Whisky How its made')
            function whisHeroInit() {
                gsap.set('.whis-hero-title', {'vertical-align': 'text-top'})
                const whisHeroLabel = new SplitText('.whis-hero-label', {type: 'lines, words'})
                const whisHeroTitle = new SplitText('.whis-hero-title', { type: 'lines, words'});
                gsap.set([whisHeroLabel.lines, whisHeroTitle.lines], {'overflow': 'hidden'})
                const whisHeroTl = gsap.timeline({
                    delay: delayTimeAfterEnter,
                });
                whisHeroTl
                .from(whisHeroLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .04 }, '0')
                .from(whisHeroTitle.words, { autoAlpha: 0 ,yPercent: 100, duration: .6, stagger: 0.04, ease: 'power2.out', onComplete: () => {
                    gsap.set('.whis-hero-title > div', {'overflow': 'visible'})
                }}, '<=.1')
                .from('.whis-hero-img-wrap', {autoAlpha: 0, duration: 1.2, ease: 'power1.inOut'}, '<=.2')

                const whisHeroImgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.whis-hero-img-wrap',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                })
                whisHeroImgTl
                .fromTo('.whis-hero-img-wrap-inner img', {'object-position': '50% 0%'}, {'object-position': '50% 100%', ease: 'linear'})
            }
            whisHeroInit()

            function whisAboutInit() {
                const whisAboutTitle = new SplitText('.whis-abt-title', { type: 'lines, chars'});
                let whisAboutTitleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-whis-abt',
                        start: 'top top+=50%',
                        end: 'bottom top+=50%',
                        scrub: .6,
                    }
                })
                whisAboutTitleTl
                .to(whisAboutTitle.chars, {color: '#ffffff', duration: .1, stagger: 0.02, ease: 'power1.out'}, '0')

                const whisAboutBgTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-whis-abt',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: .6,
                    }
                })
                whisAboutBgTl
                .fromTo('.whis-abt-bg-wrap', {yPercent: -10}, {yPercent: 10, ease: 'none'})
            }
            whisAboutInit();

            function whisMarqueeInit() {
                // let homeInvestMarqueeTl = gsap.timeline({
                //     scrollTrigger: {
                //         trigger: '.home-invest-marquee-stick-wrap',
                //         start: 'top+=50% bottom',
                //         end: `bottom+=${$(window).height()} top+=75%'`,
                //         scrub: true,
                //     }
                // })
                // let distance = $('.home-invest-marquee-stick-wrap').height() - $('.home-invest-marquee').height();
                // homeInvestMarqueeTl
                // .to('.home-invest-marquee', {y: distance, duration: 5, ease: 'none'})
                // .to('.pre-invest-bg-wrap.bg-x .pre-invest-bg:not(.mod-home-cta-mb)', {autoAlpha: 0, yPercent: -15, duration: 5, ease: 'power1.in'}, '0')
                // .fromTo('.home-invest-marquee-txt-wrap.from-right .home-invest-marquee-txt', {xPercent: 100}, {xPercent: -100, duration: 10}, '0')
                // .fromTo('.home-invest-marquee-txt-wrap.from-left .home-invest-marquee-txt', {xPercent: -100}, {xPercent: 100, duration: 10}, '0')

                let homeInvestTitleNoAnimTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.home-invest-marquee-stick-wrap',
                        start: 'top bottom',
                        end: `bottom top`,
                        scrub: true,
                    }
                })
                let distance = $('.home-invest-marquee-stick-wrap').height() - $('.home-invest-marquee').height();
                homeInvestTitleNoAnimTl
                .to('.home-invest-marquee', {y: distance, duration: 5, ease: 'none'})
            }
            whisMarqueeInit()

            function whisMainScroll() {
                let allStepGroup = $('.whis-proc-main-step-wrap');
                let allStepToc = $('.whis-proc-step-wrap');

                lenis.on('scroll', function(inst) {
                    for (let i = 0; i < allStepGroup.length; i++) {
                        let top = allStepGroup.eq(i).get(0).getBoundingClientRect().top;
                        if (top > 0 && top < ($(window).height() / 5)) {
                            allStepToc.removeClass('active');
                            allStepToc.eq(i).addClass('active');
                        }
                    }
                })

                $('.whis-proc-step-wrap').on('click', function(e) {
                    e.preventDefault();
                    let index = $(this).index();
                    lenis.scrollTo(allStepGroup.eq(index).get(0), {
                        offset: - ($(window).height() / 6)
                    })
                })
            }

            function whisMainInit() {
                const whisMainLabel = new SplitText('.whis-process-label', {type: 'lines, words'})
                const whisMainTitle = new SplitText('.whis-process-title', {type: 'lines, words'})
                const whisMainSub = new SplitText('.whis-process-sub', {type: 'lines, words'})

                gsap.set([whisMainLabel.lines,whisMainTitle.lines, whisMainSub.lines], { overflow: 'hidden' })

                const tlWhisMain = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.sc-whis-process .whis-process-title-wrap',
                        start: 'top top+=60%',
                    },
                    default: {
                        ease: 'power1.out'
                    }
                });

                tlWhisMain
                .from(whisMainLabel.words, { autoAlpha: 0, yPercent: 100, duration: 1, stagger: .04 }, '0')
                .from(whisMainTitle.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .04 }, '<=.1')
                .from(whisMainSub.words, { autoAlpha: 0, yPercent: 100, duration: .6, stagger: .02 }, '<=.1')

                const tlWhisMainNav = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.whis-process-stick-wrap',
                        start: 'top top+=60%'
                    }
                })

                tlWhisMainNav
                .from('.whis-proc-step-wrap > *', {autoAlpha: 0, yPercent: 100, duration: .8, stagger: .04})

                let allWhisListItem = $('.whis-proc-main-step-wrap');

                for (let x = 0; x < allWhisListItem.length; x++) {
                    gsap.set(allWhisListItem.eq(x).find('.whis-proc-main-step-title-wrap'), {'overflow': 'hidden'})
                    const tlWhisListItem = gsap.timeline({
                        scrollTrigger: {
                            trigger: allWhisListItem.eq(x).find('.whis-proc-main-step-title-wrap'),
                            start: 'top top+=60%',
                        }
                    })
                    tlWhisListItem
                    .from(allWhisListItem.eq(x).find('.whis-proc-main-step-title'), {autoAlpha: 0, yPercent: 100, duration: .6})

                    const allWhisListSubItem = allWhisListItem.eq(x).find('.whis-proc-main-sub-item')

                    for (let y = 0; y < allWhisListSubItem.length; y++) {
                        gsap.set(allWhisListSubItem.eq(y).find('.whis-proc-main-img-wrap'), {clipPath: 'inset(20%)'})
                        gsap.set(allWhisListSubItem.eq(y).find('.whis-proc-main-img-wrap img'), {scale: 1.4, autoAlpha: 0})


                        const whisListSubBody = new SplitText(allWhisListSubItem.eq(y).find('.whis-proc-main-sub-step-txt'), {type: 'lines, words'})
                        gsap.set(whisListSubBody.lines, {'overflow': 'hidden'})

                        const tlWhisListSubItem = gsap.timeline({
                            scrollTrigger: {
                                trigger: allWhisListSubItem.eq(y),
                                start: 'top top+=60%',
                            }
                        })
                        tlWhisListSubItem
                        .to(allWhisListSubItem.eq(y).find('.whis-proc-main-img-wrap'), { clipPath: 'inset(0%)', duration: 1.2, ease: 'expo.out'})
                        .to(allWhisListSubItem.eq(y).find('.whis-proc-main-img-wrap img'), { scale: 1, duration: 1.2, autoAlpha: 1, ease: 'expo.out', clearProps: 'all'}, '0')
                        .from(whisListSubBody.words, {autoAlpha: 0, yPercent: 100, duration: .4, stagger: .006 }, '<=.1')
                    }
                }
            }

            if ($(window).width() > 991) {
                whisMainScroll()
                whisMainInit()
            }


        },
        beforeLeave() {
            console.log('leave Whisky How its made')
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
        SCRIPT.aboutScript,
        SCRIPT.newsScript,
        SCRIPT.distilleryScript,
        SCRIPT.distilleryDtlScript,
        SCRIPT.whiskyMadeScript
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
                toggleHeaderScrollmore(data.next.namespace)
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
            async afterLeave(data) {
                toggleHeaderScrollmore(data.next.namespace)
            }
        }],
        views: VIEWS
    })
}
window.onload = mainScript