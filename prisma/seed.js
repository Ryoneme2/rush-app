const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

class SeedData {
  prismaClient = new PrismaClient();

  constructor() {
    this.Initial();
  }

  async Initial() {
    await this.InitialRoleData();
    await this.InitialContactProviderData();
    await this.InitialAccountAdminData();
    await this.InitialRestaurantCategoriesData();
    await this.InitialAccountExternalProviderData();
    await this.InitialMusicStyleData();
    await this.InitialMenuCategoriesData();
  }

  async InitialRoleData() {
    const role = this.prismaClient.aCCOUNT_TYPE;
    const roleCount = await role.count();
    if (roleCount > 0) return;

    return role.createMany({
      data: [
        {
          ID: 1,
          NAME: 'Member',
          DESCRIPTION: 'Member',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
        {
          ID: 2,
          NAME: 'Owner',
          DESCRIPTION: 'Owner',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
        {
          ID: 3,
          NAME: 'SuperAdmin',
          DESCRIPTION: 'SuperAdmin',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
  }

  async InitialContactProviderData() {
    const contactProvider = this.prismaClient.cONTACT_PROVIDER;
    const contactProviderCount = await contactProvider.count();
    if (contactProviderCount > 0) return;

    return contactProvider.createMany({
      data: [
        {
          NAME: 'Facebook',
          DESCRIPTION: 'Facebook',
          ICON_NAME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
        {
          NAME: 'Line',
          DESCRIPTION: 'Line',
          ICON_NAME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
        {
          NAME: 'Instagram',
          DESCRIPTION: 'Instagram',
          ICON_NAME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
  }

  async InitialAccountAdminData() {
    const accountProfile = this.prismaClient.aCCOUNT_PROFILE;
    const accountProfileCount = await accountProfile.count();

    const accountInternal = this.prismaClient.aCCOUNT_INTERNAL;
    const accountInternalCount = await accountInternal.count();

    if (accountProfileCount > 0 && accountInternalCount > 0) return;

    const id = await accountProfile.createMany({
      data: [
        {
          ACCOUNT_TYPE_ID: 3,
          PROFILE_PIC_PATH: '-',
          FIRST_NAME: 'Admin',
          MIDDLE_NAME: '-',
          LAST_NAME: 'Admin',
          BIRTH_DATE: new Date(),
          GENDER: 'Male',
          PHONE: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
    await accountInternal.createMany({
      data: [
        {
          ACCOUNT_PROFILE_ID: 1,
          EMAIL: 'admin@rushApp.com',
          EMAIL_VALIDATION_STATUS: false,
          USERNAME: 'admin@rushApp.com',
          PASSWORD_HASH: await hash(
            'adminRushApp',
            parseInt(process.env.HASH_SALT)
          ),
          COMFIMATION_TOKEN: '-',
          TOKEN_GENERATION_TIME: '-',
          TOKEN_RECOVERY_TIME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
  }

  async InitialRestaurantCategoriesData() {
    const restaurantCategories = this.prismaClient.rESTAURANT_CATEGORIES;
    const restaurantCategoriesCount = await restaurantCategories.count();
    if (restaurantCategoriesCount > 0) return;

    return restaurantCategories.createMany({
      data: [
        {
          NAME: 'ร้านอาหาร',
          DESCRIPTION: 'ร้านอาหาร',
          ICON_NAME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
  }

  async InitialAccountExternalProviderData() {
    const accountExternalProvider = this.prismaClient.aCCOUNT_EXTERNAL_PROVIDER;
    const accountExternalProviderCount = await accountExternalProvider.count();
    if (accountExternalProviderCount > 0) return;

    return accountExternalProvider.createMany({
      data: [
        {
          NAME: 'Fackbook',
          TYPE: 'Oauth',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
        {
          NAME: 'Google',
          TYPE: 'Oauth',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
  }

  async InitialMusicStyleData() {
    const musicStyle = this.prismaClient.mUSIC_STYLE;
    const musicStyleCount = await musicStyle.count();
    if (musicStyleCount > 0) return;

    return musicStyle.createMany({
      data: [
        { NAME: 'Pop', IS_ACTIVE: true, MODIFY_DATETIME: new Date() },
        { NAME: 'Rock', IS_ACTIVE: true, MODIFY_DATETIME: new Date() },
      ],
      skipDuplicates: true,
    });
  }
  async InitialMenuCategoriesData() {
    const menuCategories = this.prismaClient.mENU_CATEGORIES;
    const menuCategoriesCount = await menuCategories.count();
    if (menuCategoriesCount > 0) return;

    return menuCategories.createMany({
      data: [
        {
          NAME: 'อาหาร',
          DESCRIPTION: 'อาหาร',
          ICON_NAME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
        {
          NAME: 'เครื่องดื่ม',
          DESCRIPTION: 'เครื่องดื่ม',
          ICON_NAME: '-',
          IS_ACTIVE: true,
          MODIFY_DATETIME: new Date(),
        },
      ],
      skipDuplicates: true,
    });
  }
}
module.exports = new SeedData();
