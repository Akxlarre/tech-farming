import { Component, HostListener, ElementRef, signal, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../perfil/perfil.service';
import { PerfilSharedService } from '../../perfil/perfil-shared.service';

@Component({
  standalone: true,
  selector: 'app-profile-menu',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative" #menuContainer>
      <button (click)="toggleMenu()"
              aria-label="Perfil"
              class="flex items-center btn btn-ghost px-2 space-x-2 focus:ring-2 focus:ring-success">
        <div class="w-10 h-10 rounded-full ring ring-success ring-offset-base-100 ring-offset-2 overflow-hidden">
          <ng-container *ngIf="!cargandoAvatar; else skeletonAvatar">
            <img [src]="avatarUrl()" alt="Avatar" class="w-full h-full object-cover" />
          </ng-container>
          <ng-template #skeletonAvatar>
            <div class="w-full h-full bg-gray-300 animate-pulse rounded-full"></div>
          </ng-template>
        </div>
        <div class="hidden lg:flex items-center gap-1 font-medium">
          <ng-container *ngIf="!cargandoNombre; else cargandoNombreTpl">
            {{ nombre() }}
          </ng-container>
          <ng-template #cargandoNombreTpl>
            <div class="h-3 w-12 bg-base-100 rounded animate-pulse"></div>
          </ng-template>
        </div>
        <i class="hidden lg:inline-block fas fa-caret-down"></i>
      </button>

      <ul *ngIf="showMenu"
          class="menu dropdown-content absolute right-0 mt-2 p-2 shadow-lg bg-base-100 rounded-box w-56">
        <li>
          <a (click)="goProfile()"
             class="flex items-center space-x-2 hover:bg-success hover:text-base-content">
            <i class="fas fa-user"></i>
            <span>Perfil</span>
          </a>
        </li>
        <li>
          <a (click)="openLogoutModal()"
             class="flex items-center space-x-2 text-error hover:bg-error/10">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar sesión</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Modal de Confirmación de Cierre de Sesión (Diseño Mejorado) -->
    <input type="checkbox" id="modal-cerrar-sesion" class="modal-toggle" [checked]="showLogoutModal()" />
    <div class="modal z-[9999]">
      <div class="modal-box rounded-2xl shadow-xl bg-base-200 backdrop-blur-md border border-base-300">
        <div class="flex items-center mb-4">
          <span class="text-3xl text-success"><svg
            class="
              logo-svg
              fill-current
              w-6 h-6       /* xs: 24×24 */
              sm:w-8 sm:h-8 /* sm: 32×32 */
              md:w-10 md:h-10 /* md: 40×40 */
              lg:w-12 lg:h-12 /* lg+: 48×48 */
              transition-all
            "
            viewBox="0 0 1024 1024"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path  opacity="1.000000" stroke="none" d=" M633.395386,681.883789   C626.179199,701.336731 610.859314,709.069702 591.170654,703.455383   C589.148071,702.878662 587.743164,703.112671 586.273010,704.622986   C573.257019,717.994629 560.209106,731.335327 547.120422,744.635742   C545.545166,746.236511 545.191711,748.058716 545.337952,750.113098   C545.682129,754.948792 543.813904,758.846008 540.425293,762.180542   C529.382751,773.046753 518.418823,783.993408 507.303497,794.784363   C505.287048,796.741943 504.514771,798.166992 505.665924,801.147339   C511.554382,816.392151 507.570801,829.531189 496.212677,840.699158   C485.908417,850.830627 469.506500,853.871216 456.352966,847.766174   C442.205322,841.199707 434.714447,829.898071 434.704346,814.180237   C434.694580,798.970642 441.863251,787.783936 455.103516,780.604675   C458.498413,778.763916 459.743866,776.668762 459.733856,772.800659   C459.606110,723.472839 459.745117,674.144165 459.557770,624.816711   C459.523651,615.841553 458.100464,606.983521 453.612457,598.836609   C441.321899,576.525757 430.669739,553.316528 416.714569,531.917419   C399.604401,505.680420 376.418701,487.690887 346.373993,478.148682   C311.274323,467.000946 281.353851,447.652649 257.970490,418.904785   C240.452347,397.367798 231.079422,372.081482 224.622482,345.419525   C217.963562,317.923553 217.919022,290.002380 218.927872,262.067657   C219.429886,248.167603 221.208252,234.295410 223.382141,220.493362   C224.157440,215.570984 226.369125,215.273560 230.067413,215.929871   C250.028442,219.472275 269.880951,223.489822 289.213104,229.721268   C317.573181,238.862732 344.770660,250.496948 368.849701,268.372345   C401.638092,292.713226 421.512848,325.091125 428.410797,365.419617   C432.981262,392.140564 431.478485,418.607513 425.351685,445.283234   C397.958893,383.343964 354.542603,335.671753 298.341553,299.268799   C297.956543,299.614014 297.571503,299.959229 297.186462,300.304443   C299.674561,302.742523 302.046570,305.313751 304.667908,307.598999   C354.573608,351.106323 390.937073,404.315796 417.221222,464.727081   C430.904266,496.176178 444.442108,527.688477 458.022980,559.182007   C458.737854,560.839783 459.241760,562.588501 459.644989,563.731262   C459.644989,525.939026 459.620605,487.636566 459.659424,449.334167   C459.671600,437.323578 457.661591,425.531189 456.157379,413.675903   C453.558899,393.196442 452.282104,372.694733 454.465149,352.051849   C460.079315,298.963989 485.918365,256.536011 522.938782,219.590103   C559.758240,182.844757 604.042969,157.716171 650.505554,135.824524   C661.041565,130.860306 671.931580,126.651749 682.598328,121.958267   C686.145508,120.397438 688.129944,120.865097 689.832947,124.751534   C702.106812,152.761826 710.892090,181.744278 715.461792,212.028305   C717.897217,228.168228 719.481873,244.343430 719.274048,260.656525   C718.682129,307.115387 703.607971,348.288879 674.266846,384.359924   C651.765442,412.022491 623.680298,432.923218 593.890930,451.846313   C578.997375,461.307098 563.719177,470.182495 550.481018,482.057281   C531.202637,499.349976 519.829346,521.123901 513.750183,545.947754   C513.205750,548.170837 513.300232,550.579712 513.299194,552.902405   C513.270874,618.562073 513.267517,684.221802 513.269653,749.881470   C513.269714,751.034241 513.387390,752.186951 513.483948,753.959412   C518.537170,750.944580 521.078796,747.442444 521.052979,741.545105   C520.878479,701.716919 521.851257,661.861816 520.688782,622.067017   C519.827148,592.567932 532.734863,571.349182 555.013977,554.308960   C579.560364,535.534729 607.365234,522.561584 635.286011,509.878876   C660.614380,498.373779 686.569885,488.434509 713.029968,479.828979   C714.577148,479.325775 716.242493,479.072357 718.522095,476.564484   C657.610168,485.236511 602.335815,505.592651 550.492798,536.797913   C550.347107,535.623413 550.089539,535.065186 550.267578,534.767029   C571.775208,498.746216 597.785583,467.177185 636.315308,448.050751   C655.999512,438.279388 676.623962,431.817932 698.594971,429.550262   C733.305847,425.967773 766.858887,430.948517 799.648926,442.272980   C807.025513,444.820526 814.373840,447.449860 821.563354,449.981049   C822.290833,452.426270 820.795898,453.841949 819.968384,455.341461   C798.807312,493.685883 770.934387,525.860718 732.924927,548.347656   C709.973755,561.925903 685.423279,571.500488 658.810059,575.223450   C641.565308,577.635864 624.520020,575.817078 607.890381,571.590088   C576.729797,563.669617 554.842529,582.611511 546.797485,601.463013   C544.822449,606.090942 543.396729,610.899841 543.384399,615.934631   C543.305481,648.264404 543.328918,680.594360 543.329712,712.924255   C543.329773,713.720520 543.457642,714.516846 543.451599,714.446289   C552.200012,706.213257 561.258057,697.742371 570.240234,689.191711   C572.074036,687.446045 570.665894,685.416870 570.167297,683.570312   C564.696228,663.310913 575.873413,644.084839 595.871277,639.409546   C613.717957,635.237122 633.640869,650.300049 634.277527,668.609619   C634.426331,672.888306 635.035217,677.269897 633.395386,681.883789  M590.330872,282.801361   C583.282593,292.908752 576.129578,302.944977 569.204773,313.136230   C543.347412,351.190857 518.595947,389.900208 499.824829,432.087860   C488.985535,456.449066 481.327637,481.577789 481.337219,508.584595   C481.368256,596.219482 481.347412,683.854370 481.349457,771.489258   C481.349609,778.725159 481.551941,778.934570 489.242859,779.918396   C490.107758,778.067078 489.835999,776.057678 489.835663,774.096863   C489.822571,697.624756 489.777466,621.152649 489.825989,544.680542   C489.829803,538.704468 490.099091,532.677429 490.895905,526.761780   C494.159332,502.533997 502.136627,479.599243 510.918640,456.958038   C529.337769,409.471008 553.160095,364.634186 578.536011,320.586395   C594.578857,292.739044 610.763672,264.973480 626.836243,237.143219   C627.683899,235.675430 629.315491,234.294769 627.935730,231.359238   C614.756348,248.135010 602.960205,265.332092 590.330872,282.801361  M469.813446,829.847717   C481.480530,831.338318 488.114166,820.544434 487.190002,812.300720   C486.187164,803.355408 479.235199,797.929382 470.257996,798.236206   C462.554382,798.499573 455.987823,805.071960 455.470703,813.036560   C454.977509,820.632812 460.955963,828.040161 469.813446,829.847717  M615.285645,669.376526   C614.569458,667.881775 614.050720,666.245789 613.101318,664.917786   C609.765442,660.251709 605.015320,658.352356 599.540588,659.573669   C594.564209,660.683899 590.866455,663.870667 589.526245,669.033875   C588.209167,674.108521 590.183411,679.408020 594.380188,682.293762   C598.879150,685.387329 603.811401,685.658936 608.605713,683.300964   C613.955139,680.669922 616.237122,676.103149 615.285645,669.376526  z"/>
            <path  opacity="1.000000" stroke="none" d=" M322.697083,581.894165   C332.554932,567.400757 347.669037,562.234192 363.391937,567.713318   C377.791138,572.731201 386.702545,587.253235 385.154175,603.715820   C384.902557,606.390930 385.587128,607.990662 387.351593,609.799683   C399.323792,622.073608 411.044312,634.596008 423.145599,646.739746   C430.051086,653.669434 432.059204,662.037109 432.059998,671.297974   C432.061279,686.950684 432.174591,702.604858 431.982269,718.255249   C431.929871,722.520203 433.111755,725.734375 435.960602,728.997253   C446.877197,741.500610 441.223785,761.142944 425.831146,765.291687   C418.086151,767.379211 411.620972,765.053040 406.294525,759.622864   C400.587006,753.804077 398.198334,746.742981 400.368683,738.580811   C401.504669,734.308716 403.566681,730.486877 406.940460,727.601501   C409.166901,725.697510 410.019226,723.560547 410.004059,720.659058   C409.917145,704.007751 409.928406,687.355469 410.017151,670.704102   C410.034241,667.495911 409.072388,665.054871 406.737701,662.756836   C395.582764,651.777222 384.512207,640.709351 373.572052,629.516113   C371.249481,627.139771 369.609894,626.599854 366.398499,628.268616   C344.257660,639.773743 318.587189,624.736084 317.916595,599.860291   C317.750305,593.692627 319.246338,587.646545 322.697083,581.894165  M345.993347,587.183777   C344.778717,588.038147 343.420013,588.745728 342.374176,589.772156   C337.661896,594.397278 337.191772,601.443542 341.151947,606.476074   C345.418427,611.897766 351.565796,613.080750 357.539642,609.629700   C362.963989,606.496094 365.347473,599.906006 363.144073,594.133972   C360.696960,587.723572 354.966949,585.185608 345.993347,587.183777  z"/>
          </svg></span>
          <h3 class="font-bold text-xl text-success tracking-tight">Confirmar Salida</h3>
        </div>
        <p class="text-sm text-base-content leading-snug">
          Estás a punto de cerrar sesión.<br />
          ¡Te esperamos pronto de vuelta!
        </p>
        <div class="modal-action mt-6 flex justify-end gap-2">
          <button (click)="cancelLogout()"
                  class="btn btn-outline font-medium">
            Cancelar
          </button>
          <button (click)="confirmLogout()"
                  class="btn btn-outline flex items-center justify-center gap-2 bg-error text-white font-semibold shadow-md transition-all duration-200 px-4 py-2 text-center">
            <span class="text-center">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de cierre de sesión -->
    <div id="toast-logout" class="toast toast-top toast-end z-[9999] hidden">
      <div class="alert alert-success shadow-md">
        <span> Sesión cerrada correctamente</span>
      </div>
    </div>
  `
})
export class ProfileMenuComponent {
  showMenu = false;
  showLogoutModal = signal(false);

  private router = inject(Router);
  private host = inject(ElementRef);
  private authService = inject(AuthService);
  private perfilService = inject(PerfilService);
  private perfilSharedService = inject(PerfilSharedService);
  nombre = computed(() => this.perfilSharedService.nombre());
  avatarUrl = computed(() => this.perfilSharedService.avatarUrl());
  cargandoNombre = true;
  cargandoAvatar = true;

  async ngOnInit() {
    const { user, error: authError } = await this.perfilService.getUsuarioAutenticado();
    if (authError || !user) return;

    const { usuario, error: dbError } = await this.perfilService.getDatosPerfil(user.id);

    if (dbError || !usuario) return;

    // Asignar nombre para mostrar
    if (usuario.nombre) {
      this.perfilSharedService.nombre.set(usuario.nombre);
    }

    // Verificar y asignar avatar si no hay
    let avatarInicial = usuario.avatar_url;
    if (!avatarInicial) {
      const opciones = [
        'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares/avatar1.png',
        'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares/avatar2.png',
        'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares/avatar3.png',
        'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares/avatar4.png',
        'https://efejsncxndycbgfyhvcv.supabase.co/storage/v1/object/public/avatares/avatar5.png'
      ];
      avatarInicial = opciones[Math.floor(Math.random() * opciones.length)];
      await this.perfilService.actualizarUsuario(user.id, { avatar_url: avatarInicial });
    }

    this.perfilSharedService.avatarUrl.set(avatarInicial);

    const img = new Image();
    img.src = this.avatarUrl();
    img.onload = () => this.cargandoAvatar = false;
    img.onerror = () => this.cargandoAvatar = false;

    this.cargandoNombre = false;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goProfile() {
    this.showMenu = false;
    this.router.navigate(['/perfil']);
  }

  openLogoutModal() {
    this.showMenu = false;
    this.showLogoutModal.set(true);
  }

  async confirmLogout() {
    this.showLogoutModal.set(false);
    await this.authService.logout();
    this.mostrarToast();
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  mostrarToast() {
    const toast = document.getElementById('toast-logout');
    if (toast) {
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.host.nativeElement.contains(target)) {
      this.showMenu = false;
    }
  }
}
